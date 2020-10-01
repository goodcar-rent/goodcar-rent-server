import * as ACCESS from './const-access'

export const InitUserDomain = (app) => () => {
  const UserDomain = app.exModular.models.UserDomain

  return Promise.resolve()
    .then(() => UserDomain.findOne({ where: { domain: 'biomatrix.pro' } }))
    .then((item) => {
      if (!item) {
        return UserDomain.create({
          domain: 'biomatrix.pro',
          isAllow: true,
          groups: [ACCESS.ADMIN_GROUP_ID]
        })
      }
    })
    .catch((e) => { throw e })
}
