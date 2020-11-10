// DeFined verion of controller: nextgen controller for exModular
import _ from 'lodash'
import moment from 'moment'

const packageName = 'ControllerDF'

export const ControllerDF = (app) => {
  app.exModular.modules.Add({
    moduleName: packageName,
    dependency: [
      'services.errors',
      'services.errors.ServerError',
      'services.errors.ServerGenericError',
      'services.errors.ServerInvalidParameters',
      'services.errors.ServerNotFound',
      'models',
      'express',
      'services.wrap'
    ]
  })

  /**
   * processFilter: обработать свойство req.query.filter и поместить результат обработки в req.data.opt
   * @param Model - для какой модели подготовить middleware для обработки фильтра
   * @return (middleware) - возвращает middleware, подготовленное для обработки параметра filter указанной модели
   */
  const processFilter = (Model) => (req, res, next) => {
    // console.log('processFilter')
    if (!req.data) {
      req.data = {}
    }
    if (!req.data.opt) {
      req.data.opt = {}
    }

    if (!req || !req.query || !req.query.filter) {
      return next()
    }

    const filter = req.query.filter
    let f = {}
    const ret = {}

    try {
      f = JSON.parse(filter)
      // console.log('parsed:')
      // console.log(f)
    } catch (e) {
      const err = new app.exModular.services.errors.ServerInvalidParameters('filter', 'object',
        'Request\'s filter property is invalid JSON object')
      res.err = err
      return next(err)
    }

    const keys = Object.keys(f)
    // console.log('keys')
    // console.log(keys)
    keys.map((key) => {
      // console.log(`Processing key ${key}`)
      let propName = key
      let op = ''
      if (_.endsWith(key, '_gt')) {
        propName = key.substring(0, key.length - 3)
        op = '>'
      } else if (_.endsWith(key, '_gte')) {
        propName = key.substring(0, key.length - 4)
        op = '>='
      } else if (_.endsWith(key, '_lt')) {
        propName = key.substring(0, key.length - 3)
        op = '<'
      } else if (_.endsWith(key, '_lte')) {
        propName = key.substring(0, key.length - 4)
        op = '<='
      }
      let val = f[key]
      // console.log(`propName=${propName}, op=${op}, val=${val}`)
      // console.log('item')
      // console.log(item)

      // decorate ret value with proper bags:
      if (!ret.where) {
        ret.where = {}
      }
      if (!ret.whereIn) {
        ret.whereIn = []
      }
      if (!ret.whereOp) {
        ret.whereOp = []
      }
      if (!ret.whereQ) {
        ret.whereQ = []
      }

      if (key === 'q') {
        // handle special filter Q: add FTS-like search to all text fields:
        Model.props.map((prop) => {
          if (prop.type === 'text') {
            ret.whereQ.push({ column: prop.name, op: 'like', value: `%${val}%` })
          }
        })
      } else {
        // handle other filter types:
        // check if prop is exist in Model: (? dot-accessed fields in associations)
        const prop = _.find(Model.props, { name: propName })
        if (!prop) {
          const err = new app.exModular.services.errors.ServerInvalidParameters(`filter.${propName}`, 'object',
            `Request's filter param "${propName}" not found in model "${Model.name}"`)
          res.err = err
          return next(err)
        }
        if (prop.type === 'datetime') {
          // console.log(val)
          val = ((moment.utc(val)).toDate()).valueOf()
          // console.log(`val: ${val.toString()}`)
          // console.log(`val: ${val.valueOf()}`)
          val = val.valueOf()
        }
        if (Array.isArray(val)) {
          // if value is array:
          // console.log('is array')
          if (op !== '') {
            const err = new app.exModular.services.errors.ServerInvalidParameters('filter', 'object',
              'Request\'s filter property have invalid syntax - operation combined with array of values')
            res.err = err
            return next(err)
          }
          if (val.length === 1) {
            // console.log('len === 1')
            ret.where[key] = f[key][0]
          } else {
            ret.whereIn.push({ column: key, ids: val })
          }
        } else if (op !== '') {
          // add decoded operation (encoded with _lt, _gte, etc in prop name):
          ret.whereOp.push({ column: propName, op, value: val })
        } else {
          // simple propName, add like op for text, exact match for other fields:
          if (prop.type === 'text') {
            ret.whereOp.push({ column: propName, op: 'like', value: `%${val}%` })
          } else {
            ret.where[propName] = val
          }
        }
      }
    })
    // console.log('ret')
    // console.log(ret)
    _.merge(req.data.opt, ret)
    next()
  }

  /**
   * processSort: возвращает middleware для указанной модели, которое обрабатывает параметр sort из
   * req.query.sort и помещает данные в req.data.opt
   * @param Model - для какой модели подготовить middleware
   * @return взвращает middleware для указанной модели
   */
  const processSort = (Model) => (req, res, next) => {
    if (!req.data) {
      req.data = {}
    }
    if (!req.data.opt) {
      req.data.opt = {}
    }

    if (!req || !req.query || !req.query.sort) {
      return next()
    }

    const ret = req.data.opt || {}

    const sort = req.query.sort
    // console.log(sort)
    let f = {}
    try {
      f = JSON.parse(sort)
      // console.log('parsed:')
      // console.log(f)
    } catch (e) {
      const err = new app.exModular.services.errors.ServerInvalidParameters('sort', 'object',
        'Request\'s sort property is invalid JSON array')
      res.err = err
      return next(err)
    }

    if (!Array.isArray(f)) {
      const err = new app.exModular.services.errors.ServerInvalidParameters('sort', 'object',
        'Request\'s sort property is not an array')
      res.err = err
      return next(err)
    }

    if (f.length % 2) {
      const err = new app.exModular.services.errors.ServerInvalidParameters('sort', 'object',
        'Request\'s sort property should be an array with tuples (number of items should be multiply of 2)')
      res.err = err
      return next(err)
    }

    if (!ret.orderBy) {
      ret.orderBy = []
    }

    for (let ndx = 0; ndx < f.length; ndx += 2) {
      if (!_.find(Model.props, { name: f[ndx] })) {
        const err = new app.exModular.services.errors.ServerInvalidParameters(`sort[${ndx}]`, 'object',
          `Sort field "${f[ndx]}" not found in model "${Model.name}"`)
        res.err = err
        return next(err)
      }
      ret.orderBy.push({ column: f[ndx], order: f[ndx + 1].toLowerCase() })
    }

    // console.log(ret)
    _.merge(req.data.opt, ret)
    next()
  }

  /**
   * processRange: возвращает middleware для указанной модели, которое обрабатывает параметр range из
   * req.query.range и помещает данные в req.data.opt
   * @param Model - для какой модели подготовить middleware
   * @return взвращает middleware для указанной модели
   */
  const processRange = (Model) => (req, res, next) => {
    if (!req.data) {
      req.data = {}
    }
    if (!req.data.opt) {
      req.data.opt = {}
    }

    if ((!req || !req.query || !req.query.range) &&
      (!req || !req.query || !req.query.page)) {
      return next()
    }

    const ret = req.data.opt || {}

    if (req.query.range) {
      const range = req.query.range
      // console.log(sort)
      let f = {}
      try {
        f = JSON.parse(range)
        // console.log('parsed:')
        // console.log(f)
      } catch (e) {
        const err = new app.exModular.services.errors.ServerInvalidParameters('range', 'object',
          'Request\'s range query parameter is mailformed JSON object - should be array')
        res.err = err
        return next(err)
      }

      if (!Array.isArray(f)) {
        const err = new app.exModular.services.errors.ServerInvalidParameters('range', 'object',
          'Request\'s range property is not an array')
        res.err = err
        return next(err)
      }

      if (f.length !== 2) {
        const err = new app.exModular.services.errors.ServerInvalidParameters('range', 'object',
          'Request\'s range property should be an array with two values - range start and end')
        res.err = err
        return next(err)
      }

      if (!ret.range) {
        ret.range = []
      }

      if (f[1] < f[0]) {
        f[1] = f[0]
      }

      ret.range[0] = f[0]
      ret.range[1] = f[1]
      _.merge(req.data.opt, ret)
      next()
    } else if (req.query.page && req.query.perPage) {
      throw new Error('processRange: Not implemented')
      // console.log('page:')
      // console.log(req.query.page)
      // console.log(req.query.perPage)
    }
  }

  /**
   * middleware, которое отправляет подготовленные в res.data данные клиенту с кодом res.statusCode
   * @param req
   * @param res
   */
  const sendData = (req, res) => {
    // console.log('DF.sendData')
    if (res.err) {
      throw Error('Error detected on SendData!')
    }
    if (res.sendHeaders && Array.isArray(res.sendHeaders)) {
      res.sendHeaders.map((h) => res.set(h.caption, h.value))
    }
    res.status(res.statusCode ? res.statusCode : 200).json(res.data)
  }

  /**
   * async middleware (требует wrap) подготавливающее список записей для указанной модели. Список будет помещён в res.data, опции
   * списка (filter, range, sort) будут взяты из req.data.opt.
   * @param Model - модель, для которой нужно создать middleware
   * @return возвращает middleware для указанной модели
   */
  const list = (Model) => (req, res, next) => {
    // process list params: filter, etc
    // let opt = processFilter(Model, req.query.filter)
    // opt = processSort(Model, req, opt)
    // opt = processRange(Model, req, opt)
    if (!req.data) {
      req.data = {}
    }
    if (!req.data.opt) {
      req.data.opt = {}
    }
    if (!res.sendHeaders) {
      res.sendHeaders = []
    }
    const opt = req.data.opt

    // console.log('opt:')
    // console.log(opt)

    // no params or input objects
    return Promise.all([Model.findAll(opt), Model.count()])
      .then((data) => {
        const foundData = data[0]
        const count = data[1]
        // if (!foundData) {
        //   console.log('Data not found')
        //   console.log(foundData)
        // }
        // if (!count) {
        //   console.log('Count failed:')
        //   console.log(count)
        // }
        // console.log('res:')
        // console.log(foundData)
        let range0 = 0
        let range1 = count
        if (opt && opt.range && opt.range[0]) {
          range0 = opt.range[0]
        }
        if (opt && opt.range && opt.range[1]) {
          range1 = opt.range[1]
        }
        res.sendHeaders.push({ caption: 'Content-Range', value: `${Model.name} ${range0}-${range1}/${count}` })
        res.data = foundData
        return foundData
      })
      .catch((error) => {
        if (error instanceof app.exModular.services.errors.ServerError) {
          throw error
        } else {
          // console.log(error)
          throw new app.exModular.services.errors.ServerGenericError(error)
        }
      })
  }

  /**
   * async middleware (требует wrap) для создания нового экземпляра объекта ресурса по данным из body (может
   * быть как отдельным объектом, так и массивом объектов)
   * @param Model
   */
  const create = (Model) => (req, res, next) => {
    // console.log('DF.create')
    if (!req.data) {
      throw new app.exModular.services.errors.ServerInvalidParameters(
        'req.data', '', `${Model.name}.controller.create: no req.data`)
    }
    if (!res.sendHeaders) {
      res.sendHeaders = []
    }

    // check if we need to create series of data:
    if (req.data._items && Array.isArray(req.data._items)) {
      // console.log('start serial')
      const task = req.data._items.map((item) => () => {
        // console.log('item')
        return Promise.resolve(Model.create(item))
          .then((_item) => {
            // console.log('item processed')
            return _item
          })
          .catch((error) => {
            if (error instanceof app.exModular.services.errors.ServerError) {
              throw error
            } else {
              throw new app.exModular.services.errors.ServerGenericError(error)
            }
          })
      })
      return app.exModular.services.serial(task)
        .then((_items) => {
          // console.log('process items')
          if (_items && Array.isArray(_items) && _items.length === 1) {
            res.sendHeaders.push({ caption: 'Location', value: `${req.path}/${_items[0].id}` })
            res.sendHeaders.push({ caption: 'Content-Location', value: `${req.path}/${_items[0].id}` })
            res.statusCode = 201
            res.data = _items[0]
          } else {
            res.statusCode = 201
            res.data = _items
          }
          return res.data
        })
        .catch((error) => {
          if (error instanceof app.exModular.services.errors.ServerError) {
            throw error
          } else {
            throw new app.exModular.services.errors.ServerGenericError(error)
          }
        })
    } else {
      // perform create single instance:
      return Model.create(req.data)
        .then((item) => {
          res.sendHeaders.push({ caption: 'Location', value: `${req.path}/${item.id}` })
          res.sendHeaders.push({ caption: 'Content-Location', value: `${req.path}/${item.id}` })
          res.statusCode = 201
          res.data = item
          return item
        })
        .catch((error) => {
          if (error instanceof app.exModular.services.errors.ServerError) {
            throw error
          } else {
            throw new app.exModular.services.errors.ServerGenericError(error)
          }
        })
    }
  }

  const item = (Model) => (req, res, next) => {
    // validate that req have id param
    if (!req.params.id) {
      throw new app.exModular.services.errors.ServerInvalidParameters(
        'req.params.id',
        '',
        `${Model.name}.controllerDF.item: no req.params.id`)
    }

    return Model.findById(req.params.id)
      .then((foundData) => {
        if (!foundData) {
          throw new app.exModular.services.errors.ServerNotFound(Model.name, req.params.id, `${Model.name} with id ${req.params.id} not found`)
        }
        res.data = foundData
        return foundData
      })
      .catch((error) => {
        if (error instanceof app.exModular.services.errors.ServerError) {
          throw error
        } else {
          throw new app.exModular.services.errors.ServerGenericError(error)
        }
      })
  }

  const save = (Model) => (req, res, next) => {
    // validate that body have properly shaped object:
    if (!req.data) {
      throw new app.exModular.services.errors.ServerInvalidParameters(
        'req.data',
        '',
        `${Model.name}.controller.save: no req.data`)
    }
    // validate that req have id param
    if (!req.params.id) {
      throw new app.exModular.services.errors.ServerInvalidParameters(
        'req.params.id',
        '',
        `${Model.name}.controller.save: no req.params.id`)
    }

    // perform create instance:
    return Model.update(req.params.id, req.data)
      .then((foundData) => {
        res.data = foundData
        return foundData
      })
      .catch((error) => {
        if (error instanceof app.exModular.services.errors.ServerError) {
          throw error
        } else {
          throw new app.exModular.services.errors.ServerGenericError(error)
        }
      })
  }

  const remove = (Model) => (req, res, next) => {
    // check for id:
    // validate that req have id param
    if (!req.params.id) {
      throw new app.exModular.services.errors.ServerInvalidParameters(
        'req.params.id',
        '',
        'remove: no req.params.id')
    }

    return Model.removeById(req.params.id)
      .then((foundData) => {
        if (foundData) {
          res.data = foundData
          return foundData
        }
        throw new app.exModular.services.errors.ServerNotFound(Model.name, req.params.id, `${Model.name} with id ${req.params.id} not found`)
      })
  }

  const removeAll = (Model) => (req, res, next) => {
    // console.log('generic-controller.genericDeleteAll:')
    // console.log('query.filter')
    // console.log(req.query.filter)
    // console.log(req.query.filter.ids)

    req.qs = JSON.parse(req.query.filter)
    // console.log(req.qs)
    if (!(req.qs && req.qs.ids)) {
      throw new app.exModular.services.errors.ServerInvalidParameters(
        'filter', 'query parameter',
        'filter query parameter should exists and have ids property')
    }
    return Model.removeAll({ whereIn: { column: Model.key, ids: req.qs.ids } })
      .then((foundData) => {
        if (foundData) {
          res.data = foundData
          return foundData
        }
        throw new app.exModular.services.errors.ServerError('Not found - ids')
      })
      .catch((error) => {
        if (error instanceof app.exModular.services.errors.ServerError) {
          throw error
        } else {
          throw new app.exModular.services.errors.ServerGenericError(error)
        }
      })
  }

  /**
   * refsCreate: add item[s] to refs field, returns new refs field value
   * @param Model
   * @param prop
   */
  const refsCreate = (Model, prop) => (req, res, next) => {
    // validate that body have properly shaped object:
    if (!req.data) {
      throw new app.exModular.services.errors.ServerInvalidParameters(
        'req.data',
        '',
        `${Model.name}.controller.${prop.name}.refsCreate: no req.data`)
    }
    // validate that req have id param
    if (!req.params.id) {
      throw new app.exModular.services.errors.ServerInvalidParameters(
        'req.params.id',
        '',
        `${Model.name}.controller.${prop.name}.refsCreate: no req.params.id`)
    }

    const fn = Model[`${prop.name}Add`]
    return fn(req.params.id, req.data)
      .then((_items) => {
        res.statusCode = 201
        res.data = _items[prop.name]
      })
      .catch((error) => {
        if (error instanceof app.exModular.services.errors.ServerError) {
          throw error
        } else {
          throw new app.exModular.services.errors.ServerGenericError(error)
        }
      })
  }

  const refsList = (Model, prop) => (req, res, next) => {
    // validate that req have id param
    if (!req.params.id) {
      throw new app.exModular.services.errors.ServerInvalidParameters(
        'req.params.id',
        '',
        `${Model.name}.controller.${prop.name}.refsList: no req.params.id`)
    }
    return Model.findById(req.params.id)
      .then((_item) => {
        res.data = _item[prop.name]
      })
      .catch((error) => {
        if (error instanceof app.exModular.services.errors.ServerError) {
          throw error
        } else {
          throw new app.exModular.services.errors.ServerGenericError(error)
        }
      })
  }

  const refsRemove = (Model, prop) => (req, res, next) => {
    // validate that body have properly shaped object:
    if (!req.data) {
      throw new app.exModular.services.errors.ServerInvalidParameters(
        'req.data',
        '',
        `${Model.name}.controller.${prop.name}.refsRemove: no req.data`)
    }
    // validate that req have id param
    if (!req.params.id) {
      throw new app.exModular.services.errors.ServerInvalidParameters(
        'req.params.id',
        '',
        `${Model.name}.controller.${prop.name}.refsRemove: no req.params.id`)
    }

    const fn = Model[`${prop.name}Remove`]
    return fn(req.params.id, req.data)
      .then((_items) => {
        res.data = _items[prop.name]
      })
      .catch((error) => {
        if (error instanceof app.exModular.services.errors.ServerError) {
          throw error
        } else {
          throw new app.exModular.services.errors.ServerGenericError(error)
        }
      })
  }

  return {
    processFilter,
    processRange,
    processSort,
    sendData,
    create,
    list,
    item,
    save,
    remove,
    removeAll,
    refsCreate,
    refsList,
    refsRemove
  }
}
