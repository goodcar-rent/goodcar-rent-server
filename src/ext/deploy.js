import { DeployProject } from './model-deploy-project'
import { InitDeploy } from './init-deploy'

const packageName = 'Deploy'

export const Deploy = (app) => {
  app.exModular.modules.Add({
    moduleName: packageName,
    dependency: [
      'models',
      'modelAdd',
      'initAdd'
    ]
  })

  app.exModular.modelAdd(DeployProject(app))
  app.exModular.initAdd(InitDeploy(app))
  return app
}
