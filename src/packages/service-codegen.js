import fs from 'fs'
import mustache from 'mustache'

const packageName = 'codegen'

export const Codegen = (app, opt) => {
  app.exModular.modules.Add({
    moduleName: packageName,
    dependency: [
      'services.errors',
      'services.errors.ServerInvalidParameters',
      'models'
    ]
  })

  if (!opt) {
    opt = {}
  }
  opt.template = opt.template || './data/templates/code-template.txt'
  const template = (fs.readFileSync(opt.template)).toString()

  const checkModelName = (req, res, next) => {
    if (!req.params.modelName) {
      next(new app.services.errors.ServerInvalidParameters(
        'modelName',
        'string',
        'ModelName should be specified for codegen'))
    }
    const Model = app.exModular.models[req.params.modelName]
    if (!Model || !Model.props) {
      next(new app.services.errors.ServerInvalidParameters(
        'modelName',
        'string',
        'ModelName invalid - not found'))
    }
    req.model = Model
    next()
  }

  const generateCodeForModel = (req, res) => {
    if (!req.model) {
      throw new app.services.errors.ServerInvalidParameters(
        'modelName',
        'string',
        'req.model not found, use checkModelName middleware')
    }
    const txt = mustache.render(template, req.model)
    res.send(txt)
  }

  const generateList = (req, res) => {
    if (!req.model) {
      throw new app.services.errors.ServerInvalidParameters(
        'modelName',
        'string',
        'req.model not found, use checkModelName middleware')
    }
    let txt = ''
    req.model.props.map((prop) => {
      if (!prop.caption) {
        prop.caption = prop.name
      }

      switch (prop.type) {
        case 'id':
          break
        case 'text':
          txt = txt + '<TextField source=\'' + prop.name + '\' label=\'' + prop.caption + '\' />'
          break
        case 'decimal':
          txt = txt + '<NumberField source=\'' + prop.name + '\' label=\'' + prop.caption + '\' />'
          break
        case 'datetime':
          txt = txt + '<DateField source=\'' + prop.name + '\' label=\'' + prop.caption + '\' />'
          break
        case 'boolean':
          txt = txt + '<BooleanField source=\'' + prop.name + '\' label=\'' + prop.caption + '\' />'
          break
        default:
          txt = txt + '<TextField source=\'' + prop.name + '\' label=\'' + prop.caption + '\' />'
      }
    })
    res.send(txt)
  }

  const generateEdit = (req, res) => {
    if (!req.model) {
      throw new app.services.errors.ServerInvalidParameters(
        'modelName',
        'string',
        'req.model not found, use checkModelName middleware')
    }
    let txt = ''
    req.model.props.map((prop) => {
      if (!prop.caption) {
        prop.caption = prop.name
      }

      switch (prop.type) {
        case 'id':
          txt = txt + '<TextInput source=\'' + prop.name + '\' label=\'' + prop.caption + '\' disabled className={classes.wide} />'
          break
        case 'text':
          txt = txt + '<TextInput source=\'' + prop.name + '\' label=\'' + prop.caption + '\' />'
          break
        case 'decimal':
          txt = txt + '<NumberInput source=\'' + prop.name + '\' label=\'' + prop.caption + '\' />'
          break
        case 'datetime':
          txt = txt + '<DateInput source=\'' + prop.name + '\' label=\'' + prop.caption + '\' />'
          break
        case 'boolean':
          txt = txt + '<BooleanInput source=\'' + prop.name + '\' label=\'' + prop.caption + '\' />'
          break
        default:
          txt = txt + '<TextInput source=\'' + prop.name + '\' label=\'' + prop.caption + '\' />'
      }
    })
    res.send(txt)
  }

  app.exModular.routes.Add({
    method: 'GET',
    name: 'codegen',
    description: 'Generate code for model',
    path: '/codegen/:modelName',
    validate: checkModelName,
    handler: generateCodeForModel
  })

  app.exModular.routes.Add({
    method: 'GET',
    name: 'codegen',
    description: 'Generate list code for model',
    path: '/codegen/:modelName/list',
    validate: checkModelName,
    handler: generateList
  })

  app.exModular.routes.Add({
    method: 'GET',
    name: 'codegen',
    description: 'Generate list code for model',
    path: '/codegen/:modelName/edit',
    validate: checkModelName,
    handler: generateEdit
  })

  return app
}
