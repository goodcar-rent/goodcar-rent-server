import _ from 'lodash'
import { promisify } from 'util'
import fs from 'fs'

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const aclObjectsFile = '/../data/acl-objects.json'

export default (app) => {
  const Storage = {
    aclStorage: [],
    aclObjects: []
  }

  return _.merge(Storage, {
    findById: (id) => {
      const res = _.find(Storage.aclStorage, { id: id.toLowerCase() })
      return Promise.resolve(res)
    },
    findOne: (opt) => Promise.resolve(_.find(Storage.aclStorage, opt)),
    findAll: () => Promise.resolve(Storage.aclStorage),
    add: (item) => {
      Storage.aclStorage.push(item)
      return Promise.resolve(item)
    },
    aclObjectsList: () => Promise.resolve(Storage.aclObjects),
    aclObjectsSet: (data) => {
      Storage.aclObjects = data
      return Promise.reslove(data)
    },
    aclObjectsLoad: () => {
      return readFile(`${__dirname}${aclObjectsFile}`)
        .then((fileContents) => JSON.parse(fileContents))
        .then((data) => {
          Storage.aclObjects = data
          return data
        })
        .catch((err) => Promise.reject(err))
    },
    aclObjectsSave: () => {
      return writeFile(`${__dirname}${aclObjectsFile}`, JSON.stringify(Storage.aclObjects))
        .catch((err) => Promise.reject(err))
    }
  })
}
