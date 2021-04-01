/**
 server-bricks module
*/
import Path from 'path'


export const initSync = (app, opt) => {
  // load modules
  if (opt.bricks === undefined || opt.bricks === null) {
    opt.bricks = {}
    opt.bricks.auth = 'auth-bearer'
    // opt.bricks.access = 'access'
  }
  return app
}

export const init = async (app, opt) => {
  if (!opt) {
    throw Error('server-bricks.init: opt param missing')
  }

  if (!opt.bricks) {
    throw Error('server-bricks.init: opt.bricks param missing')
  }

  const modulePath = opt.modulePath ? opt.modulePath : '../modules'

  Object.keys(opt.bricks).map(async (moduleName) => {
    const Module = await import(Path.join(modulePath, opt.bricks[moduleName]))
    const moduleOpt = opt.bricks[moduleName] ? opt.bricks[moduleName].opt : undefined

    app.bricks[moduleName] = Module.default(app, moduleOpt)
    app.bricks[moduleName].name = moduleName
    app.bricks[moduleName].opt = moduleOpt
  })

  return Promise.resolve(app)
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

  initSync(app, opt)

  return await init(app, opt)
}
