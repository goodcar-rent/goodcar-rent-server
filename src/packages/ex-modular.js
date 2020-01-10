import _ from 'lodash'

export const exModular = (app) => {
  const ex = {}
  ex.app = app
  ex.modules = []
  ex.storages = []
  ex.models = {}
  ex.routes = []
  ex.services = {}
  ex.storages.default = null
  ex.access = {}
  ex.session = {}

  ex.storages.byName = (name) => {
    if (name === 'default') {
      return ex.storages.default
    }
    return _.find(ex.storages, { name })
  }

  ex.modules.Add = (module) => {
    // check storage signature
    ex.modules.push(module)
  }

  ex.storages.Add = (storage) => {
    // check storage signature
    ex.storages.push(storage)
    if (ex.storages.length === 1) {
      ex.storages.default = storage
    }
  }

  ex.storages.Init = () => {
    if (!ex.storages || ex.storages.length < 1) {
      throw new Error('.storages should be initialized')
    }
    return Promise.all(ex.storages.map((storage) => storage.storageInit()))
      .catch((e) => { throw e })
  }

  ex.storages.Close = () => {
    if (!ex.storages || ex.storages.length < 1) {
      throw new Error('.storages should be initialized')
    }
    return Promise.all(ex.storages.map((storage) => storage.storageClose()))
      .catch(e => { throw e })
  }

  ex.storages.Clear = () => {
    if (!ex.storages || !ex.models) {
      throw new Error('.storages should be initialized before initializing model')
    }
    return Promise.all(Object.keys(ex.models).map((modelName) => ex.models[modelName].dataClear()))
      .then(() => app.exModular.access.initData())
      .catch((e) => { throw e })
  }

  ex.checkDeps = () => {
    ex.modules.map((item) => {
      if (!item.dependency) {
        throw new Error(`invalid module deps format: no .dependency property for ${item.toString()}`)
      }

      if (!item.moduleName) {
        throw new Error(`Module should have .moduleName in ${item.toString()}`)
      }

      if (!Array.isArray(item.dependency)) {
        item.dependency = [item.dependency]
      }

      item.dependency.map((dep) => {
        if (!_.has(ex, dep)) {
          throw new Error(`Module deps check error: ${item.moduleName} dep "${dep}" not found`)
        }
      })
    })
  }

  // init models
  ex.modelsInit = () => {
    if (!ex.storages || !ex.models) {
      throw new Error('.storages should be initialized before initializing model')
    }
    return Promise.all(Object.keys(ex.models).map((modelName) => {
      const model = ex.models[modelName]
      if (model.storage === 'default') {
        model.storage = ex.storages.default
      }
      // ex.routesAdd(generateRoutesForModel(app, model))
      // model.
      return model.schemaInit()
    }))
      .catch((e) => { throw e })
  }
  ex.modelAdd = (model) => {
    if (!model || !model.name || !model.props) {
      throw new Error(`exModular.modelAdd: invalid schema "${model}"`)
    }
    if (!model.storage) {
      model.storage = ex.storages.default
    }
    ex.models[model.name] = model.storage.modelFromSchema(model)
  }

  ex.routes.Add = (routes) => {
    if (!routes) return
    // convert routes to array
    if (!Array.isArray(routes)) {
      routes = [routes]
    }
    routes.map((item) => {
      ex.routes.push(item)
    })
  }
  return ex
}
