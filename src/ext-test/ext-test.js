/**

 exModular project

 Test module

 This module initialize "Test" extension module.

*/
import { Note } from './model-note'
import { InitExtTest } from './init-test'

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
  app.exModular.initAdd(InitExtTest(app))

  return app
}
