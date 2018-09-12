import env from 'dotenv-safe'
import createError from 'http-errors'
import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import passport from 'passport'

import passportConfig from './config/passport-config'
import indexRouter from './routes/index'
import usersRouter from './routes/users'
import AuthRouter from './routes/auth-router'

export default () => {
  env.config()
  const app = express()
  app.express = express
  app.env = env

  // view engine setup
  app.set('views', path.join(__dirname, 'views'))
  app.set('view engine', 'pug')

  app.use(logger('dev'))
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))
  app.use(cookieParser())
  app.use(express.static(path.join(__dirname, 'public')))

  // configure passport
  app.passport = passportConfig(passport)
  app.use(app.passport.initialize({}))
  app.use(app.passport.session({}))

  app.use('/', indexRouter)
  app.use('/users', usersRouter)
  app.use('/auth', AuthRouter(app))

  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    next(createError(404))
  })

  // error handler
  app.use((err, req, res, _next) => { //eslint-disable-line
    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    // render the error page
    res.status(err.status || 500)
    res.render('error')
  })
  return app
}
