import logger from 'morgan'
import path from 'path'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import Express from 'express'

import sqliteStorage from './storage-knex-sqlite'
import { exModular } from './ex-modular'

import { Wrap } from './service-wrap'
import { Mailer } from './service-mailer'
import { Errors } from './service-errors'
import { Validator } from './service-validator'
import { RouteBuilder } from './route-builder'
import { Controller } from './service-controller'
import { ControllerDF } from './service-controller-df'
import { Codegen } from './service-codegen'
import { Seed } from './sevice-seed'
import { Serial } from './service-serial'
import { SendJson } from './service-send-json'

import { User } from './model-user'
import { UserGroup } from './model-user-group'
import { Session } from './model-session'
import { AccessObject } from './model-access-object'
import { PermissionUser } from './model-permission-user'
import { PermissionUserGroup } from './model-permission-user-group'

import { AuthJwt as Auth } from './auth-jwt'
import { AccessSimple as Access } from './access-simple'

import { InitAccess } from './init-access'
import { SignupOpen } from './signup-open'
import { AuthPassword } from './auth-password'
import { Me } from './me'

export const appBuilder = (express, options) => {
  if (!express) {
    express = Express
  }

  // build express app
  const app = express()
  app.env = process.env

  // enhance with exModular object
  app.exModular = exModular(app)

  // make default config
  options = options || {}
  options.viewEngine = options.viewEngine || 'pug'
  options.viewPath = options.viewPath || path.join(__dirname, 'views')
  options.staticPath = options.staticPath || path.join(__dirname, 'public')
  options.logger = options.logger || logger
  options.loggerOptions = options.loggerOptions || 'dev'
  options.urlencodedOptions = options.urlencodedOptions || { extended: false }
  options.cors = options.cors || cors
  options.corsOptions = options.corsOptions || {
    origin: '*',
    allowedHeaders: 'Content-Type,Authorization,Content-Range,Accept,Accept-Encoding,Accept-Language,Location,Content-Location',
    exposedHeaders: 'Content-Type,Authorization,Content-Range,Accept,Accept-Encoding,Accept-Language,Location,Content-Location'
  }

  // return promise that builds app:
  return Promise.resolve()
    .then(() => {
      app.exModular.express = express

      // configure view engine / static engine:
      app.set('views', options.viewPath)
      app.set('view engine', options.viewEngine)
      app.use(express.static(options.staticPath))

      // setup middlewares:
      app.use(options.logger(options.loggerOptions))
      app.use(express.json())
      app.use(express.urlencoded(options.urlencodedOptions))
      app.use(cookieParser())

      // init cors:
      const _cors = options.cors(options.corsOptions)
      app.use(_cors)
      app.options('*', _cors)

      // define services & other stuff:
      app.exModular.services.wrap = Wrap(app)
      app.exModular.services.mailer = Mailer(app)
      app.exModular.services.errors = Errors(app)
      app.exModular.services.validator = Validator(app)
      app.exModular.routes.builder = RouteBuilder(app)
      app.exModular.services.controller = Controller(app)
      app.exModular.services.controllerDF = ControllerDF(app)
      app.exModular.services.seed = Seed(app)
      app.exModular.services.serial = Serial(app)
      app.exModular.services.sendJson = SendJson(app)
      app.exModular.auth = Auth(app)
      app.exModular.access = Access(app)

      // define storage:
      app.exModular.storages.Add(sqliteStorage(app))

      // define models:
      app.exModular.modelAdd(User(app))
      app.exModular.modelAdd(UserGroup(app))
      app.exModular.modelAdd(Session(app))
      app.exModular.modelAdd(AccessObject(app))
      app.exModular.modelAdd(PermissionUser(app))
      app.exModular.modelAdd(PermissionUserGroup(app))

      // configure app with modules:
      SignupOpen(app)
      AuthPassword(app)
      Me(app)

      Codegen(app)

      // configure system data init:
      app.exModular.initAdd(InitAccess(app))

      // check dependings among installed modules (plugins):
      app.exModular.checkDeps()

      return app
    })
    .then(() => app)
    .catch((err) => { throw err })
}

module.exports = appBuilder
