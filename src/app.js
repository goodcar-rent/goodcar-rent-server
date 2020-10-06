import express from 'express'
import appBuilder from './packages/app-builder'
import serverBuilder from './packages/server-builder'
import { Deploy } from './ext-deploy/deploy'
import env from 'dotenv-safe'
import { ExtFin } from './ext-fin/ext-fin'

// load .env

env.config()

let app = null

// build app & server
appBuilder(express, {})
  .then((_app) => {
    app = _app
    Deploy(app)
    ExtFin(app)
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
