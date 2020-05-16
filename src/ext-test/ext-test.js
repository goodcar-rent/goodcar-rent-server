import { Note } from './model-note'

const packageName = 'ExtTest'

export const ExtTest = (app, opt) => {
  app.exModular.modules.Add({
    moduleName: packageName,
    dependency: [
      'models',
      'modelAdd',
      'initAdd'
    ]
  })

  app.exModular.modelAdd(Note(app))

//  app.exModular.services.MRP = MRP(app)

//  app.exModular.initAdd(InitUsers(app))

  return app
}
