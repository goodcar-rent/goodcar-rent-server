import { IntgConnection } from './model-intg-connection'
import { IntgImport } from './model-intg-import'
import { YCUser } from './model-yc-user'
import { YCUserContact } from './model-yc-user-contact'
import { YCDepartment } from './model-yc-department'
import { YCOrganization } from './model-yc-organization'
import { YCService } from './model-yc-service'
import { YCDomain } from './model-yc-domain'
import { YCGroup } from './model-yc-group'
import { LinkYCUser } from './model-link-yc-user'

const moduleName = 'Intg'

export const Intg = (app) => {
  const Module = {
    moduleName: moduleName,
    caption: 'Intg: Интеграция',
    description: 'Модуль для обеспечения возможности интеграции данных exModular с внешними системами',
    dependency: [
      'modules.Add'
    ],
    module: {}
  }

  app.exModular.modules.Add(Module)

  app.exModular.modelAdd(IntgConnection(app))
  app.exModular.modelAdd(IntgImport(app))
  app.exModular.modelAdd(YCUser(app))
  app.exModular.modelAdd(YCUserContact(app))
  app.exModular.modelAdd(YCDepartment(app))
  app.exModular.modelAdd(YCOrganization(app))
  app.exModular.modelAdd(YCService(app))
  app.exModular.modelAdd(YCDomain(app))
  app.exModular.modelAdd(YCGroup(app))
  app.exModular.modelAdd(LinkYCUser(app))

  Module.module.importAdd = (connectionId) => {
    // получаем подключение:
    if (!connectionId) {
      throw new Error(`${moduleName}.importAdd: connectionId param invalid`)
    }

    const IntgImport = app.exModular.models.IntgImport
    const IntgConnection = app.exModular.models.IntgConnection
    // const Serial = app.exModular.services.serial
    // const YCDepartment = app.exModular.models.YCDepartment
    // const YCOrganization = app.exModular.models.YCOrganization
    // const YCService = app.exModular.models.YCService
    // const YCDomain = app.exModular.models.YCDomain
    // const YCGroup = app.exModular.models.YCGroup

    let intgConnection = null
    let lastImport = null

    const resourcesForImport = [
      'department',
      'domain',
      'group',
      'organization',
      'service',
      'user'
    ]

    const importTask = () => ycImportData()
    return IntgConnection.findById(connectionId)
      .then((_intgConnection) => {
        if (!_intgConnection) {
          throw new Error(`${moduleName}.importAdd: connectionId=${connectionId} not found in IntgConnection`)
        }
        intgConnection = _intgConnection

        return (intgConnection.lastImportId ? IntgImport.findById(intgConnection.lastImportId) : null)
      })
      .then((_lastImport) => {
        if (intgConnection.lastImportId && !_lastImport) {
          throw new Error(`${moduleName}.importAdd: _lastImport=${intgConnection.lastImportId} not found in IntgImport`)
        }
        lastImport = _lastImport

      })
      .catch(e => { throw e })
  }

  return Module
}
