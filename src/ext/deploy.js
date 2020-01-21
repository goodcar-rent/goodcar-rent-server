import _ from 'lodash'
import { DeployProject } from './model-deploy-project'
import { DeployEvent, DeployEventType } from './model-deloy-event'
import { InitDeploy } from './init-deploy'
import GithubWebHook from 'express-github-webhook'
import { spawn } from 'child_process'
import { InitUsers } from './init-users'

const packageName = 'Deploy'

const extractBranchName = (str) => {
  const prefix = 'refs/heads/'
  if (!str || !_.startsWith(str, prefix)) {
    return ''
  }
  return str.substr(prefix.length)
}

export const Deploy = (app, opt) => {
  opt = opt || {}
  opt.webhook = opt.webhook || '/hooks/github'
  // opt.secret = opt.secret || process.env.WEBHOOK_SECRET

  app.exModular.modules.Add({
    moduleName: packageName,
    dependency: [
      'models',
      'modelAdd',
      'initAdd'
    ]
  })

  app.exModular.modelAdd(DeployProject(app))
  app.exModular.modelAdd(DeployEvent(app))

  app.exModular.initAdd(InitUsers(app))
  app.exModular.initAdd(InitDeploy(app))

  const webhookHandler = GithubWebHook({ path: opt.webhook, secret: opt.secret })

  // при поступлении события от гитхаба - разбираемся в источнике события
  // если это был сам github, то ищем нужный репозиторий
  const pushHandler = (repo, data) => {
    const DeployProject = app.exModular.models.DeployProject
    const DeployEvent = app.exModular.models.DeployEvent

    console.log(`== PUSH EVENT, repo ${repo}`)
    let project = null
    let event = null
    let proc = null
    let stdout = ''
    let stderr = ''
    DeployProject.findOne({ where: { name: repo } })
      .then((_project) => {
        if (!_project) {
          const message = `Repo ${repo} not found in Deploy Projects`
          console.log(`ERROR: ${message}`)
          return DeployEvent.create({ caption: message, type: DeployEventType.error.value })
        }
        project = _project
        return DeployEvent.create({
          type: DeployEventType.github.value,
          caption: data.head_commit.message || '',
          branch: extractBranchName(data.ref),
          commit: data.head_commit.id || '',
          projectId: project.id,
          createdAt: Date.now()
        })
      })
      .then((_event) => {
        event = _event
        proc = spawn(
          project.script,
          [event.branch],
          {
            env: process.env,
            timeout: project.scriptTimeout | 3 * 60 * 1000,
            maxBuffer: 2048 * 1024
          }
        )
        proc.stdout.on('data', (data) => {
          process.stdout.write(data)
          stdout = stdout + data.toString()
        })
        proc.stderr.on('data', (data) => {
          process.stderr.write(data)
          stderr = stderr + data.toString()
        })
        proc.on('error', (err) => {
          console.log(`Error ${err.toString()}`)
          stderr = stderr + err.toString()
          DeployEvent.findById(event.id)
            .then((ev) => {
              ev.stdout = stdout
              ev.stderr = stderr
              return DeployEvent.update(ev)
            })
            .catch((e) => { throw e })
        })
        proc.on('exit', (data) => {
          console.log(`Process exited with code ${data.toString()}`)
          DeployEvent.findById(event.id)
            .then((ev) => {
              ev.stdout = stdout
              ev.stderr = stderr
              return DeployEvent.update(ev)
            })
            .catch((e) => { throw e })
        })
      })
      .catch((e) => { throw e })

    // if (repo === 'goodcar-rent-site') {
    //   console.log('== goodcar-rent-site repo')
    //   let branch = 'master'
    //   if (data.ref === 'refs/heads/beta') {
    //     branch = 'beta'
    //   }
    //   console.log(`== Branch ${branch}`)
    //   const proc = spawn(
    //     process.env.SCRIPT_PATH,
    //     [branch],
    //     {
    //       env: process.env,
    //       timeout: process.env.SCRIPT_TIMEOUT | 3 * 60 * 1000,
    //       maxBuffer: 2048 * 1024
    //     }
    //   )
    // }
  }

  const errorHandler = (err, req, res) => {
    console.log('== ERROR:')
    console.log(err)
    // console.log(req)
    // console.log(res)
  }
  const hookHandler = (req, res) => {
    console.log(`hook! param = ${req.params.hookId}`)
    res.status(200).send('hooked!')
  }

  webhookHandler.on('push', pushHandler)
  webhookHandler.on('error', errorHandler)

  app.use(webhookHandler)
  app.get('/hooks/:hookId', hookHandler)
  app.post('/hooks/:hookId', hookHandler)

  return app
}
