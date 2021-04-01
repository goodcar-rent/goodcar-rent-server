/**
 server-bricks module
*/
import Path from 'path'

export const initOpt = (app, opt) => {
  // init options
  if (opt.bricks === undefined || opt.bricks === null) {
    opt.bricks = {}
    opt.bricks.auth = 'auth-bearer'
    // opt.bricks.access = 'access'
  }
  return app
}

export const loadModules = async (app, opt) => {
  if (!opt) {
    throw Error('server-bricks.loadModules: opt param missing')
  }

  if (!opt.bricks) {
    throw Error('server-bricks.loadModules: opt.bricks param missing')
  }

  const modulePath = opt.modulePath ? opt.modulePath : '../modules'

  Object.keys(opt.bricks).map(async (moduleName) => {
    const Module = await import(Path.join(modulePath, opt.bricks[moduleName]))
    const moduleOpt = opt.bricks[moduleName] ? opt.bricks[moduleName].opt : undefined

    app.bricks[moduleName] = Module.default(app, moduleOpt)
    app.bricks[moduleName].name = moduleName
    app.bricks[moduleName].opt = moduleOpt
    app.bricks[moduleName].status = 'constructed'
  })

  return Promise.resolve(app)
}

export const initModulesSync = (app, opt) => {
  if (!app) { throw new Error('server-bricks.initModulesSync: app param invalid') }
  if (!app.bricks) { throw new Error('server-bricks.initModulesSync: app.bricks param invalid') }

  Object.keys(app.bricks).map(async (moduleName) => {
    if (app.bricks[moduleName].initSync !== undefined &&
      typeof app.bricks[moduleName].initSync === 'function' &&
      (app.bricks[moduleName].initSync.length === 0 || app.bricks[moduleName].initSync.length === 1 || app.bricks[moduleName].initSync.length === 2)) {
      app.bricks[moduleName].initSync(app, app.bricks[moduleName].opt)
      app.bricks[moduleName].status = 'initSync'
    }
  })
  return app
}

export const initModules = async (app, opt) => {
  if (!app) { throw new Error('server-bricks.initModules: app param invalid') }
  if (!app.bricks) { throw new Error('server-bricks.initModules: app.bricks param invalid') }

  const a = []
  Object.keys(app.bricks).map(async (moduleName) => {
    if (app.bricks[moduleName].init !== undefined &&
      typeof app.bricks[moduleName].init === 'function' &&
      (app.bricks[moduleName].init.length === 0 || app.bricks[moduleName].init.length === 1 || app.bricks[moduleName].init.length === 2)) {
      a.push(() =>
        app.bricks[moduleName].init(app, app.bricks[moduleName].opt)
          .then((ret) => {
            app.bricks[moduleName].status = 'init'
            return ret
          })
          .catch(e => { throw e }))
    }
  })

  return app.bricks.services.serial(a)
}

export default async (opt) => {
  if (opt === undefined || opt === null) {
    opt = {
    } // default config
  }

  // const servicesFile = process.env.ROOT_PATH ? `${process.env.ROOT_PATH}data/config/services.js` : './data/config/services.js'
  //
  // return fs.readFile(servicesFile)
  //   .then(file => {
  //     const services = JSON.parse(file)
  //   })
  //   .then(module => {
  //   })
  //   .catch(e => { throw e })

  // check system config
  // if (app.auth === undefined || app.auth === null) {
  //   app.auth = {}
  //   app.auth.type = 'auth-bearer'
  // }

  const app = {
    opt,
    bricks: {}
  }

  // loadModules options
  initOpt(app, opt)

  // load modules
  await loadModules(app, opt)

  // init Sync
  initModulesSync(app, opt)

  await initModules(app, opt)
}
