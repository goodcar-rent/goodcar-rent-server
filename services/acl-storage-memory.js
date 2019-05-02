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
    findById: (id) => _.find(Storage.aclStorage, { id: id.toLowerCase() }),
    findOne: (opt) => _.find(Storage.aclStorage, opt),
    findAll: () => Storage.aclStorage,
    add: (item) => {
      Storage.aclStorage.push(item)
      return Storage.aclStorage.length
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
