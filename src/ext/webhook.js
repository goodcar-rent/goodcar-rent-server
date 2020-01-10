import { spawn } from 'child_process'
import GithubWebHook from 'express-github-webhook'

export const Webhook = (app) => {
  const webhookHandler = GithubWebHook({ path: '/webhook', secret: process.env.WEBHOOK_SECRET })

  app.use(webhookHandler)
  app.all('/test-webhook', (req, res) => {
    webhookHandler.emit('push', 'goodcar-rent-site', { ref: 'refs/heads/master' })
    res.status(200).send('Webhook simulated!')
  })

  webhookHandler.on('push', function (repo, data) {
    console.log('== PUSH EVENT')
    if (repo === 'goodcar-rent-site') {
      console.log('== goodcar-rent-site repo')
      let branch = 'master'
      if (data.ref === 'refs/heads/beta') {
        branch = 'beta'
      }
      console.log(`== Branch ${branch}`)
      const proc = spawn(
        process.env.SCRIPT_PATH,
        [branch],
        {
          env: process.env,
          timeout: process.env.SCRIPT_TIMEOUT | 3 * 60 * 1000,
          maxBuffer: 2048 * 1024
        }
      )
      proc.stdout.on('data', (data) => {
        process.stdout.write(data)
        // console.log(data.toString())
      })
      proc.stderr.on('data', (data) => {
        process.stderr.write(data)
        // console.log(data.toString())
      })
      proc.on('exit', (data) => {
        console.log(`Process exited with code ${data.toString()}`)
      })
    }
  })

  webhookHandler.on('error', function (err, req, res) {
    console.log('== ERROR:')
    console.log(err)
    console.log(req)
    console.log(res)
  })
  return app
}

module.exports = Webhook
