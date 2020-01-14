import uuid from 'uuid/v4'

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
      }
    ]
  }
}
