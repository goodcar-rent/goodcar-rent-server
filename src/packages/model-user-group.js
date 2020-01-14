import uuid from 'uuid/v4'

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
        default: null
      },
      {
        name: 'users',
        type: 'refs',
        default: []
      }
    ]
  }
}
