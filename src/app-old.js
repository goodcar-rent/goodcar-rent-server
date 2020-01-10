import path from 'path'
import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import createError from 'http-errors'
import logger from 'morgan'
import GithubWebHook from 'express-github-webhook'
import dotenv from 'dotenv-safe'
import { spawn } from 'child_process'

dotenv.config()

// import indexRouter from './routes/index'

const webhookHandler = GithubWebHook({ path: '/webhook', secret: 'secret' })

// use in your express app
const appOld = express()

// view engine setup
appOld.set('views', path.join(__dirname, 'views'))
appOld.set('view engine', 'pug')

appOld.use(bodyParser.json()) // must use bodyParser in express
appOld.use(webhookHandler) // use our middleware

// Now could handle following events
// webhookHandler.on('*', function (event, repo, data) {
//   console.log(event)
//   console.log(repo)
//   console.log(data)
// })

webhookHandler.on('push', function (repo, data) {
  console.log('== PUSH EVENT')
  if (repo === 'goodcar-rent-site') {
    console.log('== goodcar-rent-site repo')
    let branch = 'master'
    if (data.ref === 'refs/heads/beta') {
      branch = 'beta'
    }
    console.log(`== Branch ${branch}`)
    const proc = spawn(
      process.env.SCRIPT_PATH,
      [branch],
      {
        env: process.env,
        timeout: process.env.SCRIPT_TIMEOUT | 3 * 60 * 1000,
        maxBuffer: 2048 * 1024
      }
    )
    proc.stdout.on('data', (data) => {
      process.stdout.write(data)
      // console.log(data.toString())
    })
    proc.stderr.on('data', (data) => {
      process.stderr.write(data)
      // console.log(data.toString())
    })
    proc.on('exit', (data) => {
      console.log(`Process exited with code ${data.toString()}`)
    })
  }
})

webhookHandler.on('error', function (err, req, res) {
  console.log('== ERROR:')
  console.log(err)
  console.log(req)
  console.log(res)
})

// test route:
appOld.get('/', (req, res) => {
  res.send('Cloud Deploy 0.0.1')
})

// test webhook event:
appOld.get('/test-webhook', (req, res) => {
  webhookHandler.emit('push', 'goodcar-rent-site', { ref: 'refs/heads/master' })
  res.status(200).send('Webhook simulated!')
})

appOld.post('/test-webhook', (req, res) => {
  webhookHandler.emit('push', 'goodcar-rent-site', { ref: 'refs/heads/master' })
  res.status(200).send({ message: 'event emitted' })
})

appOld.use(logger('dev'))
appOld.use(express.urlencoded({ extended: false }))
appOld.use(cookieParser())
appOld.use(express.static(path.join(__dirname, 'public')))

// catch 404 and forward to error handler
appOld.use(function (req, res, next) {
  next(createError(404))
})

// error handler
appOld.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = appOld
