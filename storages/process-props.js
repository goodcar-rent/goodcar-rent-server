import _ from 'lodash'
import moment from 'moment'

/*
* Common utility functions for all storage engines
* */

export const processDefaults = (Model) => (item) => {
  // console.log(`processDefaults(${Model.name}, ${JSON.stringify(item)})\n`)
  const aItem = _.merge({}, item)

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
    if (prop.type === 'id') {
      Model.key = prop.name
    }
  })
  // console.log(`processDefaults result:\n${JSON.stringify(aItem)}`)
  return aItem
}

// transform some item using rules from Model:l
export const processGetProps = (Model) => (item) => {
  // console.log(`\nprocessGetProps(${Model.name}, ${JSON.stringify(item)}\n`)
  // if item is not defined, return null
  if (!item) {
    return item
  }

  const aItem = Model.processDefaults(item)

  const aKeys = Object.keys(aItem)
  aKeys.map((key) => {
    const prop = _.find(Model.props, { name: key })
    if (!prop) {
      throw new Error(`${Model.name}.processGetProps: Model "${Model.name}" does not have definition for property "${key}"`)
    }
    aItem[key] = item[key]
    if (item[key] && prop.type === 'boolean') {
      aItem[key] = (!!item[key])
    }
    if (prop.type === 'refs') {
      // console.log('refs prop')
      if (item[key].length > 0) {
        aItem[key] = item[key].split(',')
        if (!Array.isArray(aItem[key])) {
          aItem[key] = [aItem[key]]
        }
      } else {
        aItem[key] = []
      }
    }
    if (item[key] && prop.type === 'datetime') {
      aItem[key] = moment(item[key])
    }
  })
  // console.log(`processGetProps result:\n${JSON.stringify(aItem)}`)
  return aItem
}
