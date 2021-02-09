/**
 ex-modular service
*/
import fs from 'fs/promises'

const app = {}

export const exModular = (app) => {
  const servicesFile = process.env.ROOT_PATH ? `${process.env.ROOT_PATH}data/config/services.js` : './data/config/services.js'

  return fs.readFile(servicesFile)
    .then(file => {
      const services = JSON.parse(file)
    })
    .then(module => {
    })
    .catch(e => { throw e })


}
