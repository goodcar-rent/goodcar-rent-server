import { FinAcc } from './model-fin-acc'
import { FinCfo } from './model-fin-cfo'
import { FinOp } from './model-fin-op'
import { FinOrg } from './model-fin-org'
import { FinPlan } from './model-fin-plan'
import { InitExtFin } from './init-ext-fin'

const moduleName = 'ExtFin'

export const ExtFin = (app) => {
  const Module = {
    moduleName: moduleName,
    caption: 'ExtFin: Финансы',
    description: 'Модуль для учёта операций с финансами',
    dependency: [
      'modules.Add'
    ],
    module: {}
  }

  app.exModular.modules.Add(Module)

  app.exModular.modelAdd(FinAcc(app))
  app.exModular.modelAdd(FinCfo(app))
  app.exModular.modelAdd(FinOp(app))
  app.exModular.modelAdd(FinOrg(app))
  app.exModular.modelAdd(FinPlan(app))

  app.exModular.initAdd(InitExtFin(app))

  return Module
}
