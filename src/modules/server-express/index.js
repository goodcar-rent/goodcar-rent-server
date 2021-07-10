import logger from 'morgan'
import path from 'path'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import Express from 'express'
import os from 'os'
import http from 'http'
import Debug from 'debug'
import listEndpoints from 'express-list-endpoints'

// import sqliteStorage from './storage-knex-sqlite'
// import { exModular } from './ex-modular'

// import { Wrap } from './services/service-wrap'
// import { Mailer } from './services/service-mailer'
// import { Errors } from './services/service-errors'
// import { Validator } from './services/service-validator'
// import { RouteBuilder } from './route-builder'
// import { ControllerDF } from './services/service-controller-df'
// import { Codegen } from './services/service-codegen'
// import { Seed } from './services/sevice-seed'
// import { Serial } from './services/service-serial'
// import { Yandex } from '../ext-intg/service-yandex'

// import { User } from './models/model-user'
// import { UserGroup } from './models/model-user-group'
// import { Session } from './models/model-session'
// import { AccessObject } from './models/model-access-object'
// import { PermissionUser } from './models/model-permission-user'
// import { PermissionUserGroup } from './models/model-permission-user-group'

// import { AuthJwt as Auth } from './auth-jwt'
// import { AccessSimple as Access } from './access-simple'

// import { InitAccess } from './init-access'
// import { SignupOpen } from './signup-open'
// import { AuthPassword } from './auth-password'
// import { AuthSocial } from './auth-social'
// import { Me } from './me'
// import { UserDomain } from './models/model-user-domain'
// import { UserSocial } from './models/model-user-social'
// import { InitUserDomain } from './init-user-domain'
// import { SessionSocial } from './models/model-session-social'
// import { Intg } from '../ext-intg/intg'
// import { Flow } from './services/service-flow'


export default (app, opt) => {
  // define local functions:

  // init default opt:
  const makeDefOpt = (opt) => {
    opt = opt || {}
    opt.express = opt.express || Express()
    opt.viewEngine = opt.viewEngine || 'pug'
    opt.viewPath = opt.viewPath || path.join(__dirname, 'views')
    opt.staticPath = opt.staticPath || path.join(__dirname, 'public')
    opt.logger = opt.logger || logger
    opt.loggerOptions = opt.loggerOptions || 'dev'
    opt.urlencodedOptions = opt.urlencodedOptions || { extended: false }
    opt.cors = opt.cors || cors
    opt.corsOptions = opt.corsOptions || {
      origin: '*',
      allowedHeaders: 'Content-Type,Authorization,Content-Range,Accept,Accept-Encoding,Accept-Language,Location,Content-Location',
      exposedHeaders: 'Content-Type,Authorization,Content-Range,Accept,Accept-Encoding,Accept-Language,Location,Content-Location'
    }

    return opt
  }

  let express = null

  if (!opt || !opt.express) {
    express = Express()
  }

  // app.env = process.env

  // make default config
  opt = makeDefOpt(opt)


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

  return Promise.resolve()
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

  // syncInit:
  const initSync = (app, opt) => {
    const onError = (error) => {
      const err = app.bricks.notify.err

      if (!err) {
        throw new Error('Notify module not initialized')
      }
      if (error.syscall !== 'listen') {
        err(error.toString())
        throw error
      }

      // handle specific listen errors with friendly messages
      switch (error.code) {
        case 'EACCES':
          err(app.server.info.portType + ' requires elevated privileges')
          process.exit(1)
        case 'EADDRINUSE':
          err(app.server.info.portType + ' is already in use')
          process.exit(1)
        default:
          throw error
      }
    }
  }

  // return promise that builds app:
  const init = async (app, opt) =>
    Promise.resolve()
      .then(() => {
        // app.exModular.express = express

        // configure view engine / static engine:
        app.set('views', opt.viewPath)
        app.set('view engine', opt.viewEngine)
        app.use(express.static(opt.staticPath))

        // setup middlewares:
        app.use(opt.logger(opt.loggerOptions))
        app.use(express.json())
        app.use(express.urlencoded(opt.urlencodedOptions))
        app.use(cookieParser())

        // init cors:
        const _cors = opt.cors(opt.corsOptions)
        app.use(_cors)
        app.options('*', _cors)

        return app
      })
      .then(() => app)
      .catch((err) => { throw err })

  const Module = {
    // generic module API:
    initSync: (app, opt) => {},
    init,
  }

  return Module
}

module.exports = serverExpress
