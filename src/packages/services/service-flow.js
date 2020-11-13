import _ from 'lodash'

export const Flow = (app) => {
  const Service = {
    add: (flow) => {},
    flows: {}
  }

  Service.actions = [
    {
      name: 'userCount',
      models: ['User'],
      outputs: 'count',
      fn: (actionCtx) => actionCtx.models.User.count()
        .then(count => {
          actionCtx.count = count
          return actionCtx
        })
    },
    {
      name: 'userFindByEmail',
      models: 'User',
      input: 'email',
      output: 'user',
      fn: (actionCtx) => actionCtx.models.User.findOne({ where: { email: actionCtx.email } })
    },
    {
      name: 'userCheckIsFound',
      input: 'user',
      fn: (actionCtx) => {
        if (!actionCtx.user) {
          throw new Error('user not found')
        }
        return Promise.resolve(actionCtx)
      }
    },
    {
      name: 'adminAdd',
      input: 'user',
      services: 'access',
      fn: (actionCtx) => actionCtx.access.addAdmin(actionCtx.user)
    },
    {
      name: 'userCreate',
      input: 'user',
      output: 'user',
      models: 'User',
      fn: (actionCtx) => actionCtx.models.User.create(actionCtx.user)
    },
    {
      name: 'delay',
      inputs: 'ms',
      fn: (actionCtx) => {
        return new Promise(resolve => setTimeout(resolve, actionCtx.ms)).then(() => actionCtx)
      }
    }
  ]

  Service.flows['Auth.Service'] = [
    {
      action: 'userCount',
      after: (ctx, actionCtx) => {
        ctx.data.userCount = actionCtx.count
      }
    },
    {
      action: 'delay',
      before: (ctx, actionCtx) => { actionCtx.ms = 3000 }
    }
  ]

  Service.processAllActions = () => {
    if (!Service.actions) {
      return
    }
    if (!Array.isArray(Service.actions)) {
      Service.actions = [Service.actions]
    }

    Service.actions.map(_action => {
      // convert action.input into array
      if (!_action.input) {
        _action.input = []
      } else if (!Array.isArray(_action.input)) {
        _action.input = [_action.input]
      }

      // convert action.output into array
      if (!_action.output) {
        _action.output = []
      } else if (!Array.isArray(_action.output)) {
        _action.output = [_action.output]
      }

      // convert action.models into array
      if (!_action.models) {
        _action.models = []
      } else if (!Array.isArray(_action.models)) {
        _action.models = [_action.models]
      }

      if (!_action.import) {
        _action.import = { models: {} }
      }
      _action.models.map(model => {
        _action.import.models[model] = app.exModular.models[model]
        if (!_action.import.models[model]) {
          throw Error(`Action ${_action.name}: model ${model} not found, failed to init action.import`)
        }
      })
    })
  }

  Service.run = (flowName, flowCtx) => {
    // prepare first step

    const flow = Service.flows[flowName]
    if (!flow) {
      throw new Error(`flow named "${flowName}" not found`)
    }

    if (!flowCtx) {
      throw new Error('flow.run: ctx param required')
    }

    if (flowCtx.ndx === undefined) {
      flowCtx.ndx = 0
    }
    if (flowCtx.data === undefined) {
      flowCtx.data = {}
    }

    // start flow from first statement:
    return Service.runSt(flow, flowCtx)
      .catch((e) => { throw e })
  }

  Service.prepareActionCtx = (action, actionCtx) => {
    if (!actionCtx) {
      actionCtx = {}
    }

    // prepare action inputs, outputs:
    action.input.map(_input => {
      actionCtx[_input] = null
    })
    action.output.map(output => {
      actionCtx[output] = null
    })
    actionCtx.models = action.import.models

    return actionCtx
  }

  /**
   * Выполнить текущий шаг (по индексу ctx.ndx) из потока
   * @param flow
   * @param ctx
   * @return promise
   */
  Service.runSt = (flow, ctx) => {
    if (ctx.ndx === undefined) {
      throw new Error('ctx.ndx not found')
    }

    const st = flow[ctx.ndx]
    // empty st, return unmodified ctx
    if (!st) {
      ctx.ndx += 1
      return ctx
    }

    // prepare to run action:
    const action = _.find(Service.actions, { name: st.action })
    if (!action) {
      throw Error(`Action (${st.name}) not found at statement #${ctx.ndx}`)
    }
    const actionCtx = Service.prepareActionCtx(action)

    // next st:
    ctx.next = null
    if ((ctx.ndx + 1) < flow.length) {
      // we did not reach the end of flow, proceed to next statement
      ctx.next = ctx.ndx + 1
    }

    // run current st:
    if (st.before) {
      st.before(ctx, actionCtx)
    }

    return action.fn(actionCtx)
      .then(res => {
        if (st.after) {
          st.after(ctx, actionCtx)
        }
        if (ctx.next) {
          // run next st:
          ctx.ndx = ctx.next
          return Promise.resolve(Service.runSt(flow, ctx))
            .catch((e) => { throw e })
        }
        return res
      })
      .catch((e) => { throw e })
  }

  app.exModular.initAdd(() => {
    Service.processAllActions()
    return Promise.resolve()
  })

  Service.httpRequestToFlow = (flowName) => (req, res) => {
    const ctx = {}

    ctx.httpRequest = {}
    const r = {}
    r.baseUrl = req.baseUrl
    r.body = req.body
    r.cookies = req.cookies
    r.fresh = req.fresh
    r.hostname = req.hostname
    r.ip = req.ip
    r.ips = req.ips
    r.method = req.method
    r.originalUrl = req.originalUrl
    r.params = req.params
    r.path = req.path
    r.protocol = req.protocol
    r.query = req.query
    r.route = req.route
    r.secure = req.secure
    r.signedCookies = req.signedCookies
    r.stale = req.stale
    r.subdomains = req.subdomains
    r.xhr = req.xhr

    ctx.httpRequest.req = r

    return Service.run(flowName, ctx)
      .then(() => {
        // TODO: get other artifacts from ctx and decorate res with proper data (headers, cookies, etc)
        const status = ctx.httpRequest.res.status || 200
        const body = ctx.httpRequest.res.body || {}

        res.status(status).json(body)
      })
      .catch((e) => { throw e })
  }

  return Service
}
