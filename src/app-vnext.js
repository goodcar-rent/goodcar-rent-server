import ServerBricks from './core/server-bricks'
import cl from 'json-colorizer'

ServerBricks()
  .then((app) => {
    console.log(cl(JSON.stringify(app, null, 2), { pretty: true }))
    console.log(app)
  })
