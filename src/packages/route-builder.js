import _ from 'lodash'

const packageName = 'route-builder package'

export const listRouteName = 'list'
export const createRouteName = 'create'
export const removeAllRouteName = 'removeAll'
export const itemRouteName = 'item'
export const saveRouteName = 'save'
export const removeRouteName = 'remove'

export const crudRoutes = [
  listRouteName,
  createRouteName,
  removeAllRouteName,
  itemRouteName,
  saveRouteName,
  removeRouteName
]

export const routeList = (app, Model) => {
  const objectName = `${Model.name}.${listRouteName}`
  const resourcePath = Model.resourcePath ? Model.resourcePath : `/${Model.name.toLowerCase()}`
  return {
    method: 'GET',
    name: objectName,
    description: `Get list of "${Model.name}"`,
    path: resourcePath,
    before: [
      app.exModular.auth.check,
      app.exModular.access.check(objectName),
      app.exModular.services.controllerDF.processFilter(Model),
      app.exModular.services.validator.listFilterValidator(Model)
    ],
    handler: app.exModular.services.controllerDF.list(Model),
    after: [
      app.exModular.services.controllerDF.sendData
    ]
  }
}

export const routeCreate = (app, Model) => {
  const objectName = `${Model.name}.${createRouteName}`
  const resourcePath = Model.resourcePath ? Model.resourcePath : `/${Model.name.toLowerCase()}`
  return {
    method: 'POST',
    name: objectName,
    description: `Create new "${Model.name}"`,
    path: resourcePath,
    before: [
      app.exModular.auth.check,
      app.exModular.access.check(objectName),
      app.exModular.services.validator.checkBodyForArrayOfModel(Model, { optionalId: true })
    ],
    handler: app.exModular.services.controllerDF.create(Model),
    after: [
      app.exModular.services.controllerDF.sendData
    ]
  }
}

export const routeRemoveAll = (app, Model) => {
  const objectName = `${Model.name}.${removeAllRouteName}`
  const resourcePath = Model.resourcePath ? Model.resourcePath : `/${Model.name.toLowerCase()}`
  return {
    method: 'DELETE',
    name: objectName,
    description: `Delete all items from "${Model.name}"`,
    path: resourcePath,
    before: [
      app.exModular.auth.check,
      app.exModular.access.check(objectName)
    ],
    handler: app.exModular.services.controllerDF.removeAll(Model),
    after: [
      app.exModular.services.controllerDF.sendData
    ]
  }
}

export const routeItemForRefs = (app, Model) => {
  const r = []
  const resourcePath = Model.resourcePath ? Model.resourcePath : `/${Model.name.toLowerCase()}`

  r.push(_.filter(Model.props, { type: 'refs' }).map((prop) => {
    return [
      {
        method: 'POST',
        name: `${Model.name}.${prop.name}.${createRouteName}`,
        description: `Add item[s] to refs field "${Model.name}.${prop.name}"`,
        path: `${resourcePath}/:id/${prop.name.toLowerCase()}`,
        before: [
          app.exModular.auth.check,
          app.exModular.access.check(`${Model.name}.${createRouteName}`),
          app.exModular.services.validator.paramId(Model),
          prop.beforeCreate
            ? _.concat(prop.beforeCreate, app.exModular.services.validator.checkBodyForArrayOfRefs(Model, prop))
            : app.exModular.services.validator.checkBodyForArrayOfRefs(Model, prop)
        ],
        handler: app.exModular.services.controllerDF.refsCreate(Model, prop),
        after: [
          prop.afterCreate
            ? _.concat(prop.afterCreate, app.exModular.services.controllerDF.sendData)
            : app.exModular.services.controllerDF.sendData
        ]
      },
      {
        method: 'GET',
        name: `${Model.name}.${prop.name}.${listRouteName}`,
        description: `List item[s] of refs field "${Model.name}.${prop.name}"`,
        path: `${resourcePath}/:id/${prop.name.toLowerCase()}`,
        before: [
          app.exModular.auth.check,
          app.exModular.access.check(`${Model.name}.${listRouteName}`),
          app.exModular.services.validator.paramId(Model)
        ],
        handler: app.exModular.services.controllerDF.refsList(Model, prop),
        after: [
          prop.afterList
            ? _.concat(prop.afterList, app.exModular.services.controllerDF.sendData)
            : app.exModular.services.controllerDF.sendData
        ]
      },
      {
        method: 'DELETE',
        name: `${Model.name}.${prop.name}.${removeRouteName}`,
        description: `Remove item[s] of refs field "${Model.name}.${prop.name}"`,
        path: `${resourcePath}/:id/${prop.name.toLowerCase()}`,
        before: [
          app.exModular.auth.check,
          app.exModular.access.check(`${Model.name}.${removeRouteName}`),
          app.exModular.services.validator.paramId(Model),
          app.exModular.services.validator.checkBodyForArrayOfRefs(Model, prop)
        ],
        handler: app.exModular.services.controllerDF.refsRemove(Model, prop),
        after: [
          prop.afterRemove
            ? _.concat(prop.afterRemove, app.exModular.services.controllerDF.sendData)
            : app.exModular.services.controllerDF.sendData
        ]
      }
    ]
  }))
  return r
}

export const routeItem = (app, Model) => {
  const objectName = `${Model.name}.${itemRouteName}`
  const resourcePath = Model.resourcePath ? Model.resourcePath : `/${Model.name.toLowerCase()}`
  return [
    {
      method: 'GET',
      name: objectName,
      description: `Get single item of "${Model.name}" by id`,
      path: `${resourcePath}/:id`,
      before: [
        app.exModular.auth.check,
        app.exModular.access.check(objectName),
        app.exModular.services.validator.paramId(Model)
      ],
      handler: app.exModular.services.controllerDF.item(Model),
      after: [
        app.exModular.services.controllerDF.sendData
      ]
    },
    routeItemForRefs(app, Model)
  ]
}

export const routeSave = (app, Model) => {
  const objectName = `${Model.name}.${saveRouteName}`
  const resourcePath = Model.resourcePath ? Model.resourcePath : `/${Model.name.toLowerCase()}`
  return {
    method: 'PUT',
    name: objectName,
    description: `Save (update) single item in "${Model.name}"`,
    path: `${resourcePath}/:id`,
    before: [
      app.exModular.auth.check,
      app.exModular.access.check(objectName),
      app.exModular.services.validator.paramId(Model),
      app.exModular.services.validator.checkBodyForModel(Model, { optionalId: true })
    ],
    handler: app.exModular.services.controllerDF.save(Model),
    after: [
      app.exModular.services.controllerDF.sendData
    ]
  }
}

export const routeRemove = (app, Model) => {
  const objectName = `${Model.name}.${removeRouteName}`
  const resourcePath = Model.resourcePath ? Model.resourcePath : `/${Model.name.toLowerCase()}`
  return {
    method: 'DELETE',
    name: objectName,
    description: `Delete single item in "${Model.name}" by id`,
    path: `${resourcePath}/:id`,
    before: [
      app.exModular.auth.check,
      app.exModular.access.check(objectName),
      app.exModular.services.validator.paramId(Model)
    ],
    handler: app.exModular.services.controllerDF.remove(Model),
    after: [
      app.exModular.services.controllerDF.sendData
    ]
  }
}

export const RouteBuilder = (app) => {
  app.exModular.modules.Add({
    moduleName: packageName,
    dependency: [
      'services.errors',
      'services.errors.ServerError',
      'services.errors.ServerGenericError',
      'services.errors.ServerInvalidParameters',
      'services.errors.ServerNotFound',
      'services.validator',
      'services.validator.paramId',
      'services.validator.checkBodyForModel',
      'services.controllerDF',
      'services.controllerDF.list',
      'services.controllerDF.create',
      'services.controllerDF.save',
      'services.controllerDF.item',
      'services.controllerDF.remove',
      'services.controllerDF.removeAll',
      'models',
      'express',
      'services.wrap'
    ]
  })

  /**
   * routesForModel: создать или вернуть роуты, относящиеся к этой модели. Если у модели есть свойство
   * routes с ключами, совпадающими с croudRoutes, то будут использованы эти обработчики.
   * @param model
   * @param opt
   * @return {[]}
   */
  const routesForModel = (model, opt) => {
    // if no opt specified - generate all crud routes
    if (!opt) {
      opt = crudRoutes
    }

    // if only one route name specified - make it array with single item
    if (!Array.isArray(opt)) {
      opt = [opt]
    }

    // model should be provided
    if (!model) {
      throw new Error('generateRoute: invalid model param')
    }

    if (!model.routes) {
      model.routes = []
    }

    // generate routes and register them
    opt.map((routeName) => {
      if (model.routes[routeName] === null) {
      } else if (model.routes[routeName]) {
        model.routes.push(model.routes[routeName])
      } else {
        let route = null
        switch (routeName) {
          case listRouteName:
            route = routeList(app, model)
            break
          case createRouteName:
            route = routeCreate(app, model)
            break
          case itemRouteName:
            route = routeItem(app, model)
            break
          case saveRouteName:
            route = routeSave(app, model)
            break
          case removeRouteName:
            route = routeRemove(app, model)
            break
          case removeAllRouteName:
            route = routeRemoveAll(app, model)
            break
          default:
            throw new Error(`generateRoute: invalid routeName ${routeName}`)
        }
        model.routes[routeName] = route
        model.routes.push(route)
      }
    })
    return model.routes
  }

  const routesForAllModels = () => {
    const keys = Object.keys(app.exModular.models)
    keys.map((modelName) => {
      const model = app.exModular.models[modelName]
      app.exModular.routes.Add(routesForModel(model))
    })
    return app
  }

  const generateRoutes = () => {
    const Wrap = app.exModular.services.wrap

    return Promise.resolve()
      .then(() => {
        app.exModular.routes.map((route) => {
          let handlers = []

          if (route.before) {
            if (!Array.isArray(route.before)) {
              route.before = [route.before]
            }
            handlers = _.concat(handlers, _.flattenDeep(route.before))
          }

          if (route.validate) {
            if (!Array.isArray(route.validate)) {
              route.validate = [route.validate]
            }
            handlers = _.concat(handlers, _.flattenDeep(route.validate))
          }

          if (route.handler) {
            handlers = _.concat(handlers, Wrap(route.handler))
          }

          if (route.after) {
            if (!Array.isArray(route.after)) {
              route.after = [route.after]
            }
            handlers = _.concat(handlers, _.flattenDeep(route.after))
          }

          switch (route.method) {
            case 'GET':
              app.get(route.path, handlers)
              break
            case 'POST':
              app.post(route.path, handlers)
              break
            case 'PUT':
              app.put(route.path, handlers)
              break
            case 'DELETE':
              app.delete(route.path, handlers)
              break
            case 'ALL':
              app.all(route.path, handlers)
              break
          }
        })
      })
      .then(() => {
        if (app.exModular.services.errors.handler) {
          app.use(app.exModular.services.errors.handler)
        }
      })
      .then(() => app)
      .catch((e) => { throw e })
  }

  return {
    forModel: routesForModel,
    forAllModels: routesForAllModels,
    generateRoutes
  }
}
