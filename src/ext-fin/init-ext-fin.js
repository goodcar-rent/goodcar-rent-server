export const InitExtFin = (app) => () => {
  console.log('init fin')
  return app.exModular.services.seed('FinAcc', 'fin-acc.json')
    .then(() => app.exModular.services.seed('FinCfo', 'fin-cfo.json', { upsert: true }))
    .then(() => app.exModular.services.seed('FinOp', 'fin-op.json', { upsert: true }))
    .then(() => app.exModular.services.seed('FinOrg', 'fin-org.json', { upsert: true }))
    .then(() => app.exModular.services.seed('FinPlan', 'fin-plan.json', { upsert: true }))
    .catch((e) => { throw e })
}
