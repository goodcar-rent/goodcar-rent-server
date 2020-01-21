export const deployGoodCarRent = 'ba59f20d-7d3b-462c-9e6e-00f24b8bdd7e'
export const deployBetaGoodCarRent = 'a26b55fa-d7e3-4e1f-83a0-d14993ed75e0'

export const InitDeploy = (app) => () => {
  return Promise.resolve()
    .then(() => app.exModular.models.DeployProject.count())
    .then((count) => {
      if (!count || count === 0) {
        return app.exModular.models.DeployProject.create({
          id: deployGoodCarRent,
          name: 'goodcar-rent-site',
          fullName: 'goodcar-rent/goodcar-rent-site',
          script: '/home/deksden/_apps/goodcar_rent.sh',
          scriptTimeout: 180000,
          branch: 'master',
          site: 'goodcar.rent',
          siteConfig: '/etc/nginx/'
        })
          .then(() => app.exModular.models.DeployProject.create({
            id: deployBetaGoodCarRent,
            name: 'goodcar-rent-site',
            fullName: 'goodcar-rent/goodcar-rent-site',
            script: '/home/deksden/_apps/goodcar_rent.sh',
            scriptTimeout: 180000,
            branch: 'beta',
            site: 'beta.goodcar.rent',
            siteConfig: '/etc/nginx/'
          }))
      }
    })
    .catch((e) => {
      throw e
    })
}
