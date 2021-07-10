/**
 server-bricks module
*/
import Path from 'path'

const initApp = (app) => {
  if (app === undefined || app === null) {
    app = {} // default config
  }

  app.keyHandlers = app.keyHandlers || []

  // init options
  if (app.bricks === undefined || app.bricks === null) {
    app.bricks = {}
    app.bricks.services = 'services'
  } else {
    // check that system services are added:
    if (!Object.keys(app.bricks).includes('services')) {
      app.bricks.services = 'services'
    }
  }
  return app
}

/** loads module and calls constructor fn from module, returning brick */
const loadModule = async (app, moduleName) => {
  const fnName = 'server-bricks.loadModule'
  const modulePath = app.modulePath ? app.modulePath : '../modules'

  if (app.bricks.moduleName !== undefined) {
    throw Error(`${fnName}: brick "${moduleName}" already loaded`)
  }
  const Module = await import(Path.join(modulePath, app.bricks[moduleName]))

  let moduleOpt = app.bricks[moduleName] ? app.bricks[moduleName].opt : undefined
  if (moduleOpt === undefined) {
    moduleOpt = {}
  }

  const brick = Module.default(app, moduleOpt)
  app.bricks[moduleName] = brick

  // default props for brick:
  brick.name = moduleName
  brick.status = 'constructed'

  // make sure default brick API is implemented:
  if (brick.initSync === undefined) {
    // add default initSync function
    brick.initSync = (app, opt) => opt
  }
  if (brick.init === undefined) {
    // add default init function
    brick.init = async (app, opt) => opt
  }
  // check initSync function signature:
  if (!(typeof brick.initSync === 'function' &&
    (brick.initSync.length === 0 || brick.initSync.length === 1 || brick.initSync.length === 2))) {
    throw Error(`server-bricks.loadModules: brick "${brick.name}".initSync function signature is invalid`)
  }
  // check init function signature:
  if (!(typeof brick.init === 'function' && brick.init.length >= 0 && brick.init.length <= 2)) {
    throw Error(`server-bricks.loadModules: brick "${brick.name}".init function signature is invalid`)
  }

  return brick
}

const loadModules = async (app) => {
  console.log('loadModules: app:')
  console.log(app)

  const fnName = 'server-bricks.loadModules'

  if (!app) {
    throw Error(`${fnName}: app param missing`)
  }

  if (!app.bricks) {
    throw Error(`${fnName}: app.bricks param missing`)
  }

  const bricks = Object.keys(app.bricks)

  bricks.map(async (moduleName) => {
    await loadModule(app, moduleName)
  })

  console.log('loadModules: done!')
  return Promise.resolve(app)
}

export const initModulesSync = (app) => {
  console.log('initModulesSync: app:')
  console.log(app)

  if (!app) { throw new Error('server-bricks.initModulesSync: app param invalid') }
  if (!app.bricks) { throw new Error('server-bricks.initModulesSync: app.bricks param invalid') }

  Object.entries(app.bricks).map(([brickName, brick]) => {
    console.log(`  brick "${brickName}": ${JSON.stringify(brick)}`)
    brick.status = 'initSync'
    brick.initSync(app, brick)
    brick.status = 'initSyncDone'
  })

  console.log('initModulesSync: done!')
  return app
}

export const initModules = async (app) => {
  if (!app) { throw new Error('server-bricks.initModules: app param invalid') }
  if (!app.bricks) { throw new Error('server-bricks.initModules: app.bricks param invalid') }

  const a = []
  Object.entries(app.bricks).map(async ([brickName, brick]) => {
    a.push(() => {
      brick.status = 'init'

      return brick.init(app, brick)
        .then((ret) => {
          brick.status = 'initDone'
          return ret
        })
        .catch(e => { throw e })
    })
  })

  return app.bricks.services.serial(a)
}

export default async (app) => {
  /** add key handler, object with { keys, fn }. keys should be arrray of string literals or single string literal.
   * fn should be (app, brick, key) signature */
  const addKeyHandler = (keyHandler) => {
    console.log(`addKeyHandler: ${JSON.stringify(keyHandler)}`)
    if (keyHandler.status === 'added') {
      return
    }

    const fn = keyHandler.fn
    // check fn signature
    if (!(typeof fn === 'function' && fn.length === 3)) {
      throw Error(`server-bricks.addKeyHandler: key handler's for props "${JSON.stringify(keys)}" handler function signature is invalid`)
    }

    // convert keys to array:
    if (!Array.isArray(keyHandler.keys)) {
      keyHandler.keys = [keyHandler.keys]
    }
    app.keyHandlers.push(keyHandler)
    keyHandler.status = 'added'
  }

  /** handle all key handlers for every prop of every brick */
  // (?) specify skip bricks
  const processKeyHandlers = async () => {
    console.log(`processKeyHandlers: ${JSON.stringify(app.keyHandlers)}`)
    const a = []
    app.keyHandlers.map(keyHandler => {
      // process key handlers for every brick:
      Object.values(app.bricks).map(brick => {
        const brickKeys = Object.keys(brick)
        brickKeys.map(brickKey => {
          if (keyHandler.keys.includes(brickKey)) {
            // queue call to handler:
            a.push(() => Promise.resolve(keyHandler.fn(app, brick, brickKey)))
          }
        })
      })
    })

    // serially process all handlers as async array
    return app.bricks.services.serial(a)
  }

  const keyHandlerForKeyHandlers = (app, brick, key) => {
    let keyHandlers = brick[key]

    if (!Array.isArray(keyHandlers)) {
      keyHandlers = [keyHandlers]
    }
    keyHandlers.map(keyHandler => app.addKeyHandler(keyHandler))
    return Promise.resolve()
  }

  // init config options with default:
  app = initApp(app)

  // create API for object:
  app.loadModules = loadModules
  app.initModulesSync = initModulesSync
  app.initModules = initModules
  app.addKeyHandler = addKeyHandler

  // load modules
  await loadModules(app)

  // init Sync
  initModulesSync(app)

  // init modules async
  await initModules(app)

  app.addKeyHandler({ keys: 'keyHandlers', fn: keyHandlerForKeyHandlers })
  // load all key handlers:
  await processKeyHandlers()

  // now all keyHandlers are loaded from bricks, so we can process them:
  await processKeyHandlers()

  // (?) process deferred things after key handler actions:

  return Promise.resolve(app)
}
