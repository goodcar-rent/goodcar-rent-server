const packageName = 'Service.SendJson'

export const SendJson = (app) => {
  const Module = {
    moduleName: packageName,
    dependency: [],
    module: {}
  }

  app.exModular.modules.Add(Module)

  Module.module.sendJson = (req, res, next) => {
    if (res.error) {
      next(res.error)
    } else if (res.payload) {
      const statusCode = res.payload.status || 200
      return res.status(statusCode).json(res.payload)
    }
    next()
  }

  return Module.module.sendJson
}
