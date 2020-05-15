import _ from 'lodash'
import moment from 'moment'

/*
* Common utility functions for all storage engines
* */

export const processBeforeSaveToStorage = (Model) => (item) => {
  // console.log(`processBeforeSaveToStorage(${Model.name}, ${JSON.stringify(item)})\n`)
  const aItem = _.merge({}, item)

  // check if all keys are defined in model
  const aKeys = Object.keys(aItem)
  aKeys.map((key) => {
    // copy property to proxy object
    const prop = _.find(Model.props, { name: key })
    if (!prop) {
      throw new Error(`${Model.name}.processBeforeSaveToStorage: property "${key}" is not defined in model`)
    }
  })

  // process all default props if they are not defined in item:
  Model.props.map((prop) => {
    if ((prop.default || prop.default !== undefined || prop.default !== null) &&
      (!item[prop.name] || item[prop.name] === null || item[prop.name] === undefined)) {
      if (typeof prop.default === 'function') {
        aItem[prop.name] = prop.default(aItem)
      } else {
        aItem[prop.name] = prop.default
      }
    }
    if (prop.beforeSave && item[prop.name] && (typeof prop.beforeSave === 'function')) {
      // console.log(prop.beforeSave.toString())
      // console.log(aItem)
      aItem[prop.name] = prop.beforeSave(aItem)
    }
    if (prop.type === 'boolean') {
      aItem[prop.name] = item[prop.name] ? 1 : 0
    }
    if (prop.type === 'id') {
      Model.key = prop.name
    }
    if (item[prop.name] && prop.type === 'datetime') {
      aItem[prop.name] = moment(item[prop.name]).toDate()
    }

    // replace refs array with string representation
    if (prop.type === 'refs') {
      if (!item[prop.name] || item[prop.name] === [] || item[prop.name] === '') {
        aItem[prop.name] = null
      } else if (Array.isArray(item[prop.name])) {
        aItem[prop.name] = item[prop.name].join(',')
      }
    }
  })
  // console.log(`processBeforeSaveToStorage result:\n${JSON.stringify(aItem)}`)
  return aItem
}

// transform some item using rules from Model:l
export const processAfterLoadFromStorage = (Model) => (item) => {
  // console.log(`\nprocessGetProps(${Model.name}, ${JSON.stringify(item)}\n`)
  // if item is not defined, return null
  if (!item) {
    return item
  }

  const aItem = _.merge({}, item)

  const aKeys = Object.keys(aItem)
  aKeys.map((key) => {
    const prop = _.find(Model.props, { name: key })
    if (!prop) {
      throw new Error(`${Model.name}.processAfterLoadFromStorage: Model "${Model.name}" does not have definition for property "${key}"`)
    }
    aItem[key] = item[key]

    if ((prop.default || prop.default !== undefined || prop.default !== null) &&
      (!item[prop.name] || item[prop.name] === null || item[prop.name] === undefined)) {
      if (typeof prop.default === 'function') {
        aItem[prop.name] = prop.default(aItem)
      } else {
        aItem[prop.name] = prop.default
      }
    }
    if (prop.afterLoad && (typeof prop.afterLoad === 'function')) {
      aItem[prop.name] = prop.afterLoad(aItem)
    }

    if (item[key] && prop.type === 'boolean') {
      aItem[key] = (!!item[key])
    }
    if (prop.type === 'refs') {
      // console.log('refs prop')
      if (!item[key]) {
        aItem[key] = []
      } else if (item[key].length > 0) {
        aItem[key] = item[key].split(',')
        if (!Array.isArray(aItem[key])) {
          aItem[key] = [aItem[key]]
        }
      } else {
        aItem[key] = []
      }
    }
    if (item[key] && prop.type === 'datetime') {
      aItem[key] = moment(item[key]).toDate()
    }
  })
  // console.log(`processAfterLoadFromStorage result:\n${JSON.stringify(aItem)}`)
  return aItem
}
