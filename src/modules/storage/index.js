import Path from 'path'

export default (app, opt) => {
  /** loads driver by name, by default use driverPath option to find driver */
  const loadDriver = async (driverName) => {
    const fnName = 'storage.loadDriver'
    if (app.bricks.storage.drivers.driverName !== undefined) {
      throw Error(`${fnName}: driver "${driverName}" already loaded`)
    }
    const aPath = app.bricks.storage.driverPath || '../storage-drivers'
    const Driver = await import(Path.join(aPath, driverName))

    app.bricks.storage.drivers.driverName = Driver
  }

  const keyHandlerSchemas = (app, brick, key) => {

  }

  return {
    initSync: (app, opt) => {},
    init: (app, opt) => Promise.resolve(),
    loadDriver,
    keyHandlers: [
      {
        fn: keyHandlerSchemas,
        keys: 'schemas'
      }
    ]
  }
}
