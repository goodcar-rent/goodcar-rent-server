export const accessGuest = '12a507e4-d101-467a-97d4-f65a3b71f57c'
export const accessLoggedIn = '5b52b35e-986d-484a-adb1-e466ad72cfd5'
export const accessAdmin = '416db26a-a15d-4c57-ac2d-786a69857f4d'

export const initData = (app) => () => {
  const UserGroup = app.exModular.models.UserGroup
  return Promise.resolve()
    .then(() => UserGroup.findById(accessGuest))
    .then((item) => {
      if (!item) {
        return UserGroup.create({
          id: accessGuest,
          name: 'Guests',
          systemType: 'Guest',
          users: []
        })
      }
      return item
    })
    .then(() => UserGroup.findById(accessLoggedIn))
    .then((item) => {
      if (!item) {
        return UserGroup.create({
          id: accessLoggedIn,
          name: 'Logged-In',
          systemType: 'LoggedIn',
          users: []
        })
      }
      return item
    })
    .then(() => UserGroup.findById(accessAdmin))
    .then((item) => {
      if (!item) {
        return UserGroup.create({
          id: accessAdmin,
          name: 'Admin',
          systemType: 'Admin',
          users: []
        })
      }
      return item
    })
    .catch((e) => { throw e })
}
