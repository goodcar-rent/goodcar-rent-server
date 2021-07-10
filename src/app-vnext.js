import ServerBricks from './core/server-bricks'
import cl from 'json-colorizer'

const app = {
  appName: 'goodcar-rent-server',
  version: '0.3.0',
  modulePath: '../modules',
  bricks: {
    storage: 'storage'
  }
}

ServerBricks(app)
  .then((app) => {
    console.log(cl(JSON.stringify(app, null, 2), { pretty: true }))
    console.log(app)
  })
