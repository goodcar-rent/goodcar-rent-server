import Debug from 'debug'
import http from 'http'
import os from 'os'
import listEndpoints from 'express-list-endpoints'

export const serverBuilder = (app, options) => {
  const onError = (error) => {
    if (error.syscall !== 'listen') {
      throw error
    }
    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        app.server.error(app.server.info.portType + ' requires elevated privileges')
        process.exit(1)
      case 'EADDRINUSE':
        app.server.error(app.server.info.portType + ' is already in use')
        process.exit(1)
      default:
        throw error
    }
  }

  /**
   * Event listener for HTTP server "listening" event.
   */
  const onListening = () => {
    app.server.log(`Listening on http://${app.server.info.hostname}:${app.server.info.port.toString()}`)
  }

  // migrate database on exit:
  const onClose = () => {
    if (app.storage && app.storage.db && app.storage.db.migrate) {
      return app.storage.db.migrate.latest({})
        .then(() => app.storage.db.destroy())
        .catch(() => process.exit(1))
    }
  }

  return Promise.resolve()g
    .then(() => {
      // create info object with some server meta:
      const info = {}
      const port = process.env.PORT | 3000
      info.port = (typeof port === 'string' ? port : parseInt(port, 10))
      info.portType = (typeof port === 'string' ? 'Pipe' : 'Port')
      info.hostname = os.hostname()
      info.url = `http://${info.hostname}:${info.port.toString()}`

      // create http server:
      app.set('port', info.port)
      app.server = http.createServer(app)
      app.server.info = info

      // init debug objects:
      app.server.debug = Debug('express-knex-server-example:server')
      app.server.error = Debug('express-knex-server-example:error')
      app.server.log = console.log

      // spin up server:
      app.server.listen(info.port)
      app.server.on('error', onError)
      app.server.on('listening', onListening)
      app.server.on('close', onClose)

      console.log(listEndpoints(app))
    })
    .then(() => app)
    .catch((e) => { throw e })
}

module.exports = serverBuilder
