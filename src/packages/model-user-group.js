import { v4 as uuid } from 'uuid'

export const UserGroup = (app, options) => {
  if (!options) {
    options = {}
  }
  options.storage = options.storage || 'default'

  return {
    name: 'UserGroup',
    priority: 0,
    props: [
      {
        name: 'id',
        type: 'id',
        default: () => uuid()
      },
      {
        name: 'name',
        type: 'text',
        default: null
      },
      {
        name: 'systemType',
        type: 'text',
        default: ''
      },
      {
        name: 'users',
        type: 'refs',
        model: 'User',
        default: []
      }
    ]
  }
}
