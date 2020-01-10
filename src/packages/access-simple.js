import { accessLoggedIn, accessAdmin } from './access-system'

const packageName = 'Access-simple'

export const AccessSimple = (app) => {
  app.exModular.modules.Add({
    moduleName: packageName,
    dependency: [
      'models',
      'models.UserGroup',
      'models.UserGroup.usersAdd'
    ]
  })

  const registerLoggedUser = (user) => {
    if (!user || !user.id) {
      throw Error(`${packageName}.registerLoggedUser: invalid param "user" - ${user.toString()}`)
    }

    return app.exModular.models.UserGroup.usersAdd(accessLoggedIn, user.id)
      .catch((e) => { throw e })
  }

  const unregisterLoggedUser = (user) => {
    if (!user || !user.id) {
      throw Error(`${packageName}.unregisterLoggedUser: invalid param "user" - ${user.toString()}`)
    }

    return app.exModular.models.UserGroup.usersRemove(accessLoggedIn, user.id)
      .catch((e) => { throw e })
  }

  const addAdmin = (user) => {
    if (!user || !user.id) {
      throw Error(`${packageName}.addAdmin: invalid param "user" - ${user.toString()}`)
    }

    return app.exModular.models.UserGroup.usersAdd(accessAdmin, user.id)
      .catch((e) => { throw e })
  }

  return {
    registerLoggedUser,
    unregisterLoggedUser,
    addAdmin
  }
}
