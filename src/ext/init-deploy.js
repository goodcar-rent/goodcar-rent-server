export const deployGoodCarRent = 'ba59f20d-7d3b-462c-9e6e-00f24b8bdd7e'

export const InitDeploy = (app) => () => {
  return Promise.resolve()
    .then(() => app.exModular.models.DeployProject.count())
    .then((count) => {
      if (!count || count === 0) {
        return app.exModular.models.DeployProject.create({
          id: deployGoodCarRent,
          name: 'goodcar-rent-site',
          fullName: 'goodcar-rent/goodcar-rent-site'
        })
      }
    })
    .catch((e) => {
      throw e
    })
}
