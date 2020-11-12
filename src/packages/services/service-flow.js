import _ from 'lodash'

export const Flow = (app) => {
  const Service = {
    add: (flow) => {},
    flows: {}
  }

  Service.actions = [
    {
      name: 'countUsers',
      models: ['User'],
      outputs: 'count',
      fn: (ctx) => ctx.models.User.count()
        .then(count => {
          ctx.count = count
          return ctx
        })
    },
    {
      name: 'delay',
      inputs: 'ms',
      fn: (ctx) => {
        return new Promise(resolve => setTimeout(resolve, ctx.ms)).then(() => ctx)
      }
    }
  ]

  Service.flows['Auth.Service'] = [
    {
      action: 'countUsers',
      after: (ctx) => {
        ctx.data.userCount = ctx.countUsers.count
      }
    },
    {
      action: 'delay',
      before: (ctx) => { ctx.delay.ms = 3000 }
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
    })
  }

  Service.run = (flowName, ctx) => {
    // prepare first step

    const flow = Service.flows[flowName]
    if (!flow) {
      throw new Error(`flow named "${flowName}" not found`)
    }

    ctx.ndx = 0
    ctx.data = {}

    // start flow from first statement:
    return Service.runSt(flow, ctx)
      .catch((e) => { throw e })
  }

  Service.prepareCtx = (action, ctx) => {
    // prepare action's own ctx:
    ctx[action.name] = {}
    const actionCtx = ctx[action.name]
    // prepare action inputs, outputs:
    action.input.map(_input => {
      actionCtx[_input] = null
    })
    action.output.map(output => {
      actionCtx[output] = null
    })

    // prepare imported models:
    if (!actionCtx.models) {
      actionCtx.models = {}
    }

    action.models.map(model => {
      actionCtx.models[model] = app.exModular.models[model]
      if (!actionCtx.models[model]) {
        throw Error(`Action ${action.name}: model ${model} not found, failed to init ctx`)
      }
    })
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
    Service.prepareCtx(action, ctx)

    // next st:
    ctx.next = null
    if ((ctx.ndx + 1) < flow.length) {
      // we did not reach the end of flow, proceed to next statement
      ctx.next = ctx.ndx + 1
    }

    // run current st:
    if (st.before) {
      st.before(ctx)
    }

    return action.fn(ctx[action.name])
      .then(res => {
        if (st.after) {
          st.after(ctx)
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

  return Service
}
