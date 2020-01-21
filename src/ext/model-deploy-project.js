import uuid from 'uuid/v4'
import fs from 'fs'

export const DeployProject = () => {
  return {
    name: 'DeployProject',
    priority: 0,
    props: [
      {
        name: 'id',
        type: 'id',
        format: 'uuid',
        default: () => uuid()
      },
      {
        name: 'name',
        type: 'text',
        format: 'name',
        default: null
      },
      {
        name: 'fullName',
        type: 'text',
        format: 'email',
        default: null
      },
      {
        name: 'script',
        type: 'text',
        format: 'text',
        size: 127,
        default: ''
      },
      {
        name: 'scriptTimeout',
        type: 'text',
        format: 'text',
        size: 64,
        default: ''
      },
      {
        name: 'branch',
        type: 'text',
        format: 'text',
        size: 64,
        default: ''
      },
      {
        name: 'site',
        type: 'text',
        format: 'text',
        size: 127,
        default: ''
      },
      {
        name: 'siteConfigPath',
        type: 'text',
        format: 'text',
        size: 127,
        default: ''
      },
      {
        name: 'siteConfig',
        type: 'calculated',
        getter: (item) => {
          if (item && item.siteConfigPath && fs.existsSync(item.siteConfigPath)) {
            return fs.readFileSync(item.siteConfigPath).toString()
          }
          return ''
        }
      }
    ]
  }
}
