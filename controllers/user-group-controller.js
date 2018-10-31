import { genericCreate, genericDelete, genericItem, genericList, genericSave } from '../services/generic-controller'
import { ServerError, ServerGenericError } from '../config/errors'

export default module.exports = (app) => {
  const Model = app.models.UserGroup

  return {
    list: genericList(Model),
    create: genericCreate(Model),
    item: genericItem(Model),
    save: genericSave(Model),
    delete: genericDelete(Model),
    usersList: (req, res) => {
      return Model.usersList(req.params.id)
        .then((users) => {
          res.json(users)
          return users
        })
        .catch((error) => {
          if (error instanceof ServerError) {
            throw error
          } else {
            throw new ServerGenericError(error)
          }
        })
    },
    usersAdd: (req, res) => {
      return Model.usersAdd(req.params.id, req.matchedData.users)
        .then((item) => {
          res.json(item)
          return item
        })
        .catch((error) => {
          if (error instanceof ServerError) {
            throw error
          } else {
            throw new ServerGenericError(error)
          }
        })
    },
    usersRemove: (req, res) => {
      return Model.usersRemove(req.params.id, req.matchedData.users)
        .then((item) => {
          res.json(item)
          return item
        })
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
