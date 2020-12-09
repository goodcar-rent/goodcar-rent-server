import _ from 'lodash'
import * as flowActions from '../flows/flow-actions'
import * as flowAuth from '../flows/flow-auth'
import { ST } from '../flows/flow-types'

export const Flow = (app) => {
  const Service = {
    add: (name, flow) => {
      if (!name) {
        return
      }
      Service.flows[name] = flow
    },
    flows: {}
  }
  Service.actions = flowActions.actions

  Service.flows['Auth.Signup'] = flowAuth.authSignup
  Service.flows['Auth.Service._ifAdmin'] = flowAuth.authServiceIfAdmin
  Service.flows['Auth.СheckDomain'] = flowAuth.authCheckDomain

  Service.processAllActions = () => {
    if (!Service.actions) {
      return
    }
    // if (!Array.isArray(Service.actions)) {
    //   Service.actions = [Service.actions]
    // }

    _.forOwn(Service.actions, (_action) => {
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

      // process params:
      const processParams = (params) => {
        if (!params) { return [] }

        return params.map((item) => {
          const i = {
            name: '',
            type: 'string',
            required: false
          }
          if (typeof item === 'string') {
            i.name = item
            if (_.startsWith(item, '!')) {
              // required property
              i.required = true
              i.name = item.substring(1)
            }
            if (_.startsWith(item, '?')) {
              // required property
              i.required = false
              i.name = item.substring(1)
            }
          } else if (typeof item === 'object' && item.name) {
            i.name = item.name
            i.required = item.required
            i.type = item.type
          } else {
            throw new Error(`processAllActions.processParams: unknown type of item ${typeof item}`)
          }
          return i
        })
      }
      _action.input = processParams(_action.input)
      _action.output = processParams(_action.output)

      // process models
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

      // process services:
      if (!_action.services) {
        _action.services = []
      } else if (!Array.isArray(_action.services)) {
        _action.services = [_action.services]
      }

      if (!_action.import.services) {
        _action.import.services = {}
      }
      _action.services.map(service => {
        _action.import.services[service] = app.exModular[service] ? app.exModular[service] : app.exModular.services[service]
        if (!_action.import.services[service]) {
          throw Error(`Action ${_action.name}: service ${service} not found, failed to init action.import`)
        }
      })
    })
  }

  /**
   * Метод для запуска действия по имени. Можно передать начальный контекст.
   * @param flowName имя потока действий, который будет запущен
   * @param flowCtx начальный контекст
   * @return {Promise<ctx>} возвращается Promise с контекстом на момент завершения выполнения
   */
  Service.run = (flowName, flowCtx) => {
    // console.log(`Run flow ${flowName} with context:\n${JSON.stringify(flowCtx)}`)
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
    return Service.runSt(flow, flowCtx).catch((e) => { throw e })
  }

  /**
   * Подготовить контекст действия: инициализировать null все входящие параметры и возвращаемые переменные, а также инициализировать .models и .services в stCtx
   * @param action действие, для которого нужно инициализировать контекст
   * @param stCtx объект контекста действия для инициализации
   * @return {<stCtx>>} возвращается подготовленный контекст действия
   */
  Service.prepareActionCtx = (action, stCtx) => {
    if (!stCtx) {
      stCtx = {}
    }

    // prepare action inputs, outputs:
    action.input.map(item => {
      stCtx[item.name] = null
    })
    action.output.map(item => {
      stCtx[item.name] = null
    })
    stCtx.models = action.import.models
    stCtx.services = action.import.services

    return stCtx
  }

  /**
   * Выполнить текущий шаг (по индексу ctx.flow.ndx) из потока
   * @param flow
   * @param ctx
   * @return promise
   */
  Service.runSt = (flow, ctx) => {
    // console.log(`Run statement,\n flow: ${JSON.stringify(flow)}\n ctx: ${JSON.stringify(ctx)}`)
    if (ctx === undefined || ctx.flow === undefined || ctx.flow.ndx === undefined) {
      throw new Error('ctx.flow.ndx not found')
    }

    const st = flow[ctx.flow.ndx]
    // empty st, return unmodified ctx
    if (!st) {
      ctx.flow.ndx += 1
      return Promise.resolve(ctx)
    }

    // next st:
    ctx.flow.next = null
    if ((ctx.flow.ndx + 1) < flow.length) {
      // we did not reach the end of flow, proceed to next statement
      ctx.flow.next = ctx.flow.ndx + 1
    }

    // if we have and action:
    return Promise.resolve()
      .then(() => {
        if (st.action) {
          return Service.runStAction(flow, ctx).catch(e => { throw e })
        } else if (st.type === ST.IF) {
          return Service.runStIF(flow, ctx).catch(e => { throw e })
        }
      })
      .then(() => {
        if (ctx.flow.next) {
          // run next st:
          ctx.flow.ndx = ctx.flow.next
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

    // console.log(`run action #${ctx.flow.ndx}: ${JSON.stringify(st)}\n ctx:${JSON.stringify(ctx)}`)

    // prepare to run action:
    const action = st.action // _.find(Service.actions, { name: st.action })
    if (!action || typeof action !== 'object') {
      throw Error(`Action (${st.name}) not found at statement #${ctx.flow.ndx} or not object (${typeof action})`)
    }
    const stCtx = Service.prepareActionCtx(action)
    // console.log(` stCtx: ${JSON.stringify(stCtx)}`)

    // run current st:
    const before = (st.before ? Promise.resolve(st.before(ctx, stCtx)).catch(e => { throw e }) : Promise.resolve())

    return before
      .then(() => {
        // check if we have all inputs before fn:
        action.input.map((item) => {
          if (item.required && (stCtx[item.name] === undefined || stCtx[item.name] === null)) {
            throw new Error(`runStAction: flow #${ctx.flow.ndx}, action ${action.name}, param ${item.name} - input required, but not found`)
          }
        })
      })
      .then(() => Promise.resolve(action.fn(stCtx)))
      .then((res) => {
        // check if we have all inputs before fn:
        action.output.map((item) => {
          if (item.required && (stCtx[item.name] === undefined || stCtx[item.name] === null)) {
            throw new Error(`runStAction: flow #${ctx.flow.ndx}, action ${action.name}, param ${item.name} - output required, but not found`)
          }
        })
        return res
      })
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
    // console.log(`run IF #${ctx.flow.ndx}: ${JSON.stringify(st)}`)
    if (st.type !== ST.IF) {
      throw new Error('runStIf called on other type of statement')
    }

    const stCtx = {}

    // run current st:
    let _conditionRes = null
    const before = Service.runHook(st.before, ctx, stCtx) // (st.before ? Promise.resolve(st.before(ctx, stCtx)) : Promise.resolve())
    return before
      .then(() => Promise.resolve(st.condition(ctx)))
      .then(res => {
        // save result of condition evaluation:
        _conditionRes = res

        // run "after" handler:
        return Service.runHook(st.after, ctx, stCtx) // (st.after ? Promise.resolve(st.after(ctx, stCtx)) : Promise.resolve())
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
      .then(() => Service.runHook(st.afterBlock, ctx, stCtx)) // (st.after ? Promise.resolve(st.after(ctx, stCtx)) : Promise.resolve()))
      .catch((e) => { throw e })
  }

  /**
   * Выполнить обработкич события (before/after) для statement
   * @param hook - переменная, где хранится обработчик. Может быть пустой (если обработчик не определён), отдельной функцией с сигнатурой (ctx, stCtx) или массивом функций с подобной сигнатурой.
   * @param ctx - с каким параметром ctx вызывать обработчик/обработчики
   * @param stCtx - с каким параметром stCtx вызывать обработчик/обработчики
   * @returns возвращает Promise c результатом обработчика/или массив с результатами обработчиков
   */
  Service.runHook = (hook, ctx, stCtx) => {
    // no hook defined, ok - rerurn empty promise
    if (!hook) {
      return Promise.resolve()
    }
    if (!Array.isArray(hook)) {
      return Promise.resolve(hook(ctx, stCtx))
    }

    // у нас - массив обработчиков. Подготовить массив для выполнения через .serial
    const arr = hook.map((_hook) => {
      const fn = () => { return Promise.resolve(_hook(ctx, stCtx)) }
      return fn
    })
    return app.services.serial(arr)
  }

  Service.hookAdd = (hooks, fn) => {
    if (!hooks) {
      return []
    }

    if (!Array.isArray(hooks)) {
      hooks = [hooks]
    }

    return hooks.push(fn)
  }

  /**
   * Добавить stToAdd в скрипт flow после идентификатора stToFind
   * @param flow
   * @param stToFind
   * @param stToAdd
   * @return новый массив flow, старый массив остается нетронутым
   */
  Service.flowAddStAfter = (flow, stToFind, stToAdd) => {
    if (!Array.isArray(flow)) {
      throw new Error('flowAddStAfter: flow parameter is not array')
    }
    const newFlow = _.clone(flow)
    const ndx = _.findIndex(newFlow, stToFind)
    if (ndx === -1) {
      throw new Error(`flowAddStAfter: st not found, stToFind: ${JSON.stringify(stToFind)} not found in flow ${JSON.stringify(flow)}`)
    }
    newFlow.splice(ndx + 1, 0, stToAdd)

    return newFlow
  }

  Service.flowMW = (flowName) => (req, res) => {
    const ctx = { http: { req, res } }
    ctx.http.res.body = {}
    ctx.http.res.statusCode = 200

    return Service.run(flowName, ctx)
      .then(() => {
        // TODO: get other artifacts from ctx and decorate res with proper data (headers, cookies, etc)
        const status = ctx.http.res.statusCode || 200
        const body = ctx.http.res.body || {}

        return res.status(status).json(body)
      })
      .catch((e) => {
        console.log(`MW: ${e.toString()}`)
        let status = 500
        if (e.status) {
          status = e.status
        }
        const body = {
          error: e.toString()
        }
        return res.status(status).json(body)
      })
  }

  app.exModular.initAdd(() => {
    Service.processAllActions()
    return Promise.resolve()
  })

  return Service
}
