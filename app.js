import env from 'dotenv-safe'
import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'

import Auth from './config/auth'
import Models from './config/models'
import indexRouter from './routes/index'
import usersRouter from './routes/users'
import AuthRouter from './routes/auth-router'
import InviteRouter from './routes/invite-router'
import ErrorHandlers from './config/error-handlers'
import wrap from './services/wrap'

export default () => {
  env.config()
  const app = express()
  app.express = express
  app.env = process.env

  // view engine setup
  app.set('views', path.join(__dirname, 'views'))
  app.set('view engine', 'pug')

  if (app.env.NODE_ENV === 'develompent') {
    app.use(logger('dev'))
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
  app.use('/', indexRouter)
  app.use('/users', usersRouter)
  app.use('/auth', InviteRouter(app))
  app.use('/auth', AuthRouter(app))

  // catch 404 and forward to error handler
//  app.use(function (req, res, next) {
//    next(createError(404))
//  })

  /*
  // error handler
  app.use((err, req, res, _next) => { //eslint-disable-line
    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    // render the error page
    res.status(err.status || 500)
    res.render('error')
  })
  */
  ErrorHandlers(app)

  return app
}
