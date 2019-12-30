import express from 'express'
import bodyParser from 'body-parser'

import GithubWebHook from 'express-github-webhook'

const webhookHandler = GithubWebHook({ path: '/webhook', secret: 'secret' })

// use in your express app
const app = express()
app.use(bodyParser.json()) // must use bodyParser in express
app.use(webhookHandler) // use our middleware

// Now could handle following events
webhookHandler.on('*', function (event, repo, data) {
  console.log(event)
  console.log(repo)
  console.log(data)
})

webhookHandler.on('event', function (repo, data) {
  console.log(repo)
  console.log(data)
})

webhookHandler.on('reponame', function (event, data) {
  console.log(event)
  console.log(data)
})

webhookHandler.on('error', function (err, req, res) {
  console.log(err)
  console.log(req)
  console.log(res)
})
