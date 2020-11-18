import _ from 'lodash'

export const ST = {
  IF: 'IF'
}

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
      fn: (stCtx) => stCtx.models.User.count()
        .then(count => {
          stCtx.count = count
          return stCtx
        })
    },
    {
      name: 'userFindByEmail',
      models: 'User',
      input: 'email',
      output: 'user',
      fn: (stCtx) => stCtx.models.User.findOne({ where: { email: stCtx.email } })
        .then((_user) => {
          stCtx.user = _user
          return _user
        })
    },
    {
      name: 'userCheckIsFound',
      input: 'user',
      fn: (stCtx) => {
        if (!stCtx.user) {
          throw new Error('user not found')
        }
        return Promise.resolve(stCtx)
      }
    },
    {
      name: 'adminAdd',
      input: 'user',
      services: 'access',
      fn: (stCtx) => stCtx.access.addAdmin(stCtx.user)
    },
    {
      name: 'userCreate',
      input: 'user',
      output: 'user',
      models: 'User',
      fn: (stCtx) => stCtx.models.User.create(stCtx.user)
    },
    {
      name: 'delay',
      inputs: 'ms',
      fn: (stCtx) => {
        return new Promise(resolve => setTimeout(resolve, stCtx.ms)).then(() => stCtx)
      }
    }
  ]

  Service.flows['Auth.Service._ifAdmin'] = [
    {
      action: 'adminAdd',
      before: (ctx, stCtx) => {
        stCtx.user = ctx.user
      },
      after: (ctx, stCtx) => {
        ctx.data.addedAsAdmiт = true
      }
    }
  ]

  Service.flows['Auth.Service'] = [
    {
      action: 'userCount',
      after: (ctx, stCtx) => {
        ctx.data.userCount = stCtx.count
        ctx.data.addAsAdmin = (stCtx.count === 1)
      }
    },
    {
      action: 'userFindByEmail',
      before: (ctx, stCtx) => {
        stCtx.email = ctx.http.req.body.email
      },
      after: (ctx, stCtx) => {
        if (stCtx.user) {
          throw new Error(`User with email ${stCtx.email} already registered`)
        }
      }
    },
    {
      action: 'userCreate',
      before: (ctx, stCtx) => {
        stCtx.user = ctx.http.req.body
      },
      after: (ctx, stCtx) => {
        ctx.data.user = stCtx.user
      }
    },
    {
      type: ST.IF,
      condition: (ctx) => {
        return ctx.data.addAsAdmin
      },
      flow: 'Auth.Service._ifAdmin'
    }
    // {
    //   action: 'delay',
    //   before: (ctx, stCtx) => { stCtx.ms = 3000 }
    // }
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

    if (!flowCtx.flow || flowCtx.flow.ndx === undefined) {
      flowCtx.flow = { ndx: 0 }
    }
    if (flowCtx.data === undefined) {
      flowCtx.data = {}
    }

    // start flow from first statement:
    return Service.runSt(flow, flowCtx)
      .catch((e) => { throw e })
  }

  Service.prepareActionCtx = (action, stCtx) => {
    if (!stCtx) {
      stCtx = {}
    }

    // prepare action inputs, outputs:
    action.input.map(_input => {
      stCtx[_input] = null
    })
    action.output.map(output => {
      stCtx[output] = null
    })
    stCtx.models = action.import.models

    return stCtx
  }

  /**
   * Выполнить текущий шаг (по индексу ctx.flow.ndx) из потока
   * @param flow
   * @param ctx
   * @return promise
   */
  Service.runSt = (flow, ctx) => {
    if (ctx.flow.ndx === undefined) {
      throw new Error('ctx.flow.ndx not found')
    }

    const st = flow[ctx.flow.ndx]
    // empty st, return unmodified ctx
    if (!st) {
      ctx.flow.ndx += 1
      return Promise.resolve(ctx)
    }

    // next st:
    ctx.next = null
    if ((ctx.flow.ndx + 1) < flow.length) {
      // we did not reach the end of flow, proceed to next statement
      ctx.next = ctx.flow.ndx + 1
    }

    // if we have and action:
    return Promise.resolve()
      .then(() => {
        if (st.action) {
          return Service.runStAction(flow, ctx)
        } else if (st.block === ST.IF) {
          return Service.runStIF(flow, ctx)
        }
      })
      .then(() => {
        if (ctx.next) {
          // run next st:
          ctx.flow.ndx = ctx.next
          return Promise.resolve(Service.runSt(flow, ctx))
            .catch((e) => { throw e })
        }
        return Promise.resolve(ctx)
      })
      .catch((e) => { throw e })
  }

  /**
   * Run action statement
   * @param flow
   * @param ctx
   * @return promise
   */
  Service.runStAction = (flow, ctx) => {
    const st = flow[ctx.flow.ndx]

    // prepare to run action:
    const action = _.find(Service.actions, { name: st.action })
    if (!action) {
      throw Error(`Action (${st.name}) not found at statement #${ctx.flow.ndx}`)
    }
    const stCtx = Service.prepareActionCtx(action)

    // run current st:
    const before = (st.before ? Promise.resolve(st.before(ctx, stCtx)) : Promise.resolve())
    return before
      .then(() => Promise.resolve(action.fn(stCtx)))
      .then(res => {
        return (st.after ? Promise.resolve(st.after(ctx, stCtx)) : Promise.resolve())
      })
      .catch((e) => { throw e })
  }

  /**
   * Run "if" statement
   * @param flow
   * @param ctx
   */
  Service.runStIF = (flow, ctx) => {
    const st = flow[ctx.flow.ndx]
    if (st.type !== ST.IF) {
      throw new Error('runStIf called on other type of statement')
    }

    const stCtx = {}

    // run current st:
    let _conditionRes = null
    const before = (st.before ? Promise.resolve(st.before(ctx, stCtx)) : Promise.resolve())
    return before
      .then(() => Promise.resolve(st.condition(stCtx)))
      .then(res => {
        // save result of condition evaluation:
        _conditionRes = res

        // run "after" handler:
        return (st.after ? Promise.resolve(st.after(ctx, stCtx)) : Promise.resolve())
      })
      .then(() => {
        // proceed to specified flow, if condition is true:
        if (_conditionRes === true) {
          // prepare context of new flow: same as original ctx, except .flow part (because flow is new)
          const newFlowCtx = _.assign({}, ctx, { flow: { ndx: 0, next: null } })
          return Service.run(st.flow, newFlowCtx)
            .then(() => {
              // copy results of flow execution from flowCtx to original ctx:
              ctx = _.assign(ctx, _.omit(newFlowCtx, ['flow']))
              return ctx
            })
        }
      })
      .catch((e) => { throw e })
  }

  app.exModular.initAdd(() => {
    Service.processAllActions()
    return Promise.resolve()
  })

  Service.flowMW = (flowName) => (req, res) => {
    const ctx = { http: { req, res } }
    // const r = {}
    // r.baseUrl = req.baseUrl
    // r.body = req.body
    // r.cookies = req.cookies
    // r.fresh = req.fresh
    // r.hostname = req.hostname
    // r.ip = req.ip
    // r.ips = req.ips
    // r.method = req.method
    // r.originalUrl = req.originalUrl
    // r.params = req.params
    // r.path = req.path
    // r.protocol = req.protocol
    // r.query = req.query
    // r.route = req.route
    // r.secure = req.secure
    // r.signedCookies = req.signedCookies
    // r.stale = req.stale
    // r.subdomains = req.subdomains
    // r.xhr = req.xhr

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
