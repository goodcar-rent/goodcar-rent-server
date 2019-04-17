import { ServerError, ServerGenericError, ServerNotFound } from '../config/errors'

export const genericList = (Model) => (req, res) =>
  Promise.all([Model.findAll(), Model.count()])
    .then((data) => {
      const foundData = data[0]
      const count = data[1]
      res.set('Content-Range', `${Model.name} 0-${count}/${count}`).json(foundData)
      return foundData
    })
    .catch((error) => {
      if (error instanceof ServerError) {
        throw error
      } else {
        throw new ServerGenericError(error)
      }
    })

export const genericCreate = (Model) => (req, res) =>
  Model.create(req.matchedData)
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

export const genericItem = (Model) => (req, res) =>
  Model.findById(req.params.id)
    .then((foundData) => {
      if (!foundData) {
        throw ServerNotFound(Model.name, req.params.id, `${Model.name} with id ${req.params.id} not found`)
      }
      res.json(foundData)
      return foundData
    })
    .catch((error) => {
      if (error instanceof ServerError) {
        throw error
      } else {
        throw new ServerGenericError(error)
      }
    })

export const genericSave = (Model) => (req, res) => {
  req.matchedData.id = req.params.id
  return Model.update(req.matchedData)
    .then((foundData) => {
      res.json(foundData)
      return foundData
    })
    .catch((error) => {
      if (error instanceof ServerError) {
        throw error
      } else {
        throw new ServerGenericError(error)
      }
    })
}

export const genericDelete = (Model) => (req, res) =>
  Model.removeById(req.params.id)
    .then((foundData) => {
      if (foundData) {
        res.json(foundData)
        return foundData
      }
      throw new ServerNotFound(Model.name, req.params.id, `${Model.name} with id ${req.params.id} not found`)
    })
