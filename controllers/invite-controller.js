import { ServerError, ServerGenericError, ServerNotFound } from '../config/errors'
import { genericCreate, genericDelete, genericDeleteAll, genericItem, genericList, genericSave } from '../services/generic-controller'

export default module.exports = (app) => {
  const Model = app.models.Invite
  const _create = genericCreate(Model)

  return {
    list: genericList(Model),

    create: (req, res) => {
      // fill optional field - expireAt
      // if (!req.matchedData.expireAt) {
      //   req.matchedData.expireAt = new Date(Date.now() + 60000000)
      // }

      // fill optional field - createdBy
      if (!req.matchedData.createdBy) {
        req.matchedData.createdBy = null
        if (req.user) {
          req.matchedData.createdBy = req.user.id
        }
      }

      // fill optional field - assignUserGroups
      if (!req.matchedData.assignUserGroups) {
        req.matchedData.assignUserGroups = []
      }

      return _create(req, res)
    },

    item: genericItem(Model),
    save: genericSave(Model),
    delete: genericDelete(Model),
    deleteAll: genericDeleteAll(Model),

    send: (req, res) => {
      return Model.findById(req.params.id)
        .then((foundData) => {
          if (!foundData) {
            throw ServerNotFound('Invite', req.params.id, 'Invite not found')
          }
          const msg = `# Invite for GoodCar.rent site registration\n\r
            \n\r
            Please use this link to [register](${app.serverAddress}/auth/signup?invite=${foundData.id})`
          return app.mail(foundData.email, 'Invite for GoodCar.rent', msg)
        })
        .then(() => res.sendStatus(200))
        .catch((error) => {
          if (error instanceof ServerError) {
            throw error
          } else {
            throw new ServerGenericError(error)
          }
        })
    }
  }
}
