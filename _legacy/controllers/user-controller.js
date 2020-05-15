import { genericCreate, genericDelete, genericItem, genericList, genericSave } from '../services/generic-controller'

export default module.exports = (app) => {
  const Model = app.models.User

  return {
    list: genericList(Model),
    create: genericCreate(Model),
    item: genericItem(Model),
    save: genericSave(Model),
    delete: genericDelete(Model)
  }
}
