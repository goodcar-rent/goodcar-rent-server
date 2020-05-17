export const InitUsers = (app) => () => {
  return Promise.resolve()
    .then(() => app.exModular.models.User.count())
    .then((count) => {
      if (!count || count === 1) {
        return app.exModular.models.User.create({
          name: 'John Admin',
          email: 'admin@email.net',
          password: 'admin12345'
        })
          .then((user) => app.exModular.access.addAdmin(user))
          .catch((e) => { throw e })
      }
    })
    .catch((e) => { throw e })
}
