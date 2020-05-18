import { v4 as uuid } from 'uuid'

export const DeployEventType = {
  unknown: { value: 0, caption: '(unknown)' },
  error: { value: 1, caption: '(error)' },
  github: { value: 2, caption: 'Github event' },
  webhook: { value: 3, caption: 'Webhook event' }
}

export const DeployEvent = () => {
  return {
    name: 'DeployEvent',
    priority: 0,
    props: [
      {
        name: 'id',
        type: 'id',
        format: 'uuid',
        default: () => uuid()
      },
      {
        name: 'caption',
        type: 'text',
        format: 'name',
        default: null
      },
      {
        name: 'type',
        type: 'enum',
        format: [
          { value: DeployEventType.unknown.value, caption: DeployEventType.unknown.caption },
          { value: DeployEventType.error.value, caption: DeployEventType.error.caption },
          { value: DeployEventType.github.value, caption: DeployEventType.github.caption },
          { value: DeployEventType.webhook.value, caption: DeployEventType.webhook.caption }
        ],
        default: DeployEventType.unknown.value
      },
      {
        name: 'payload',
        type: 'text',
        format: 'text',
        size: 254,
        default: ''
      },
      {
        name: 'projectId',
        type: 'ref',
        model: 'DeployProject',
        default: null
      },
      {
        name: 'branch',
        type: 'text',
        format: 'text',
        size: 64,
        default: ''
      },
      {
        name: 'commit',
        type: 'text',
        format: 'text',
        size: 64,
        default: ''
      },
      {
        name: 'stderr',
        type: 'text',
        format: 'text',
        size: 4096,
        default: ''
      },
      {
        name: 'stdout',
        type: 'text',
        format: 'text',
        size: 4096,
        default: ''
      },
      {
        name: 'createdAt',
        type: 'datetime',
        format: 'YYYY/MM/DD',
        default: () => Date.now()
      },
      {
        name: 'status',
        type: 'text',
        format: 'text',
        size: 64,
        default: ''
      },
      {
        name: 'statusMessage',
        type: 'text',
        format: 'text',
        default: ''
      }
    ]
  }
}
