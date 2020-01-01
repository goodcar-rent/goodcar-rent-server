import path from 'path'
import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import createError from 'http-errors'
import logger from 'morgan'
import GithubWebHook from 'express-github-webhook'
import dotenv from 'dotenv-safe'
import { exec } from 'child_process'

dotenv.config()

// import indexRouter from './routes/index'

const webhookHandler = GithubWebHook({ path: '/webhook', secret: 'secret' })

// use in your express app
const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(bodyParser.json()) // must use bodyParser in express
app.use(webhookHandler) // use our middleware

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
    const proc = exec(
      `${process.env.SCRIPT_PATH} ${branch}`,
      {
        env: process.env,
        timeout: 90 * 1000
      },
      (err, stdout, stderr) => {
        console.log('== exec')
        if (err) {
          console.log('== ERROR on exec:')
          console.log(err)
          console.error(err)
        }
        console.log('== Std streams:')
        console.log(stdout)
        console.log(stderr)
      }
    )
    console.log('== Proc details: ')
    console.log(proc)
  }
})

webhookHandler.on('error', function (err, req, res) {
  console.log('== ERROR:')
  console.log(err)
  console.log(req)
  console.log(res)
})

// test route:
app.get('/', (req, res) => {
  res.send('Cloud Deploy 0.0.1')
})

app.use(logger('dev'))
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
