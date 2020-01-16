import express from 'express'
import appBuilder from './packages/app-builder'
import serverBuilder from './packages/server-builder'
// import Webhook from './ext/webhook'
import { Deploy } from './ext/deploy'
import env from 'dotenv-safe'

// load .env

env.config()

let app = null

// build app & server
appBuilder(express, {})
  .then((_app) => {
    app = _app
    // Webhook(app)
    Deploy(app)
  })
  .then(() => app.exModular.storages.Init()) // init storages
  .then(() => app.exModular.modelsInit())
  .then(() => {
    app.exModular.routes.builder.forAllModels()
    return app.exModular.routes.builder.generateRoutes()
  })
  .then(() => app.exModular.initAll())
  .then(() => serverBuilder(app, {}))
  .catch((e) => { throw e })
