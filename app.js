import env from 'dotenv-safe'
import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'

import Auth from './config/auth'
import Models from './config/models'
import indexRouter from './routes/index'
import UserRouter from './routes/user-router'
import AuthRouter from './routes/auth-router'
import LoginRouter from './routes/login-router'
import InviteRouter from './routes/invite-router'
import UserGroupRouter from './routes/user-group-router'
import AclRouter from './routes/acl-router'
import MeRouter from './routes/me-router'
import ErrorHandlers from './config/error-handlers'
import wrap from './services/wrap'
import mail from './services/mail'

export default () => {
  env.config()
  const app = express()
  app.Promise = Promise
  app.express = express
  app.env = process.env
  app.asyncInit = []

  // view engine setup
  app.set('views', path.join(__dirname, 'views'))
  app.set('view engine', 'pug')

  if (app.env.NODE_ENV === 'development' || app.env.NODE_ENV === 'test') {
    app.use(logger('dev'))
  }

  if (app.env.NODE_ENV === 'development' || app.env.NODE_ENV === 'test') {
    app.enable('trust proxy')
  }
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))
  app.use(cookieParser())
  app.use(express.static(path.join(__dirname, 'public')))

  // configure models
  app.models = Models(app)

  // configure auth via passport
  app.passport = Auth(app)
  app.use(app.auth.initialize())
  app.wrap = wrap

  // configure routes
  app.use(AclRouter(app))
  app.use('/', indexRouter)
  app.use(UserRouter(app))
  app.use(InviteRouter(app))
  app.use('/auth', AuthRouter(app))
  app.use(LoginRouter(app))
  app.use(UserGroupRouter(app))
  app.use(MeRouter(app))

  ErrorHandlers(app)

  app.serverPort = app.serverPort | 80
  app.serverAddress = `http://localhost:${app.serverPort}`
  app.mail = mail

  return app
}
