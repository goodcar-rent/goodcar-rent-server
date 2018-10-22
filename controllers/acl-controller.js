import { kindAllow } from '../services/acl'


export default module.exports = (app) => {
  return {
    list: (req, res) => {
      const resp = app.auth.ListACL()
      console.log(resp)
      return res.json(resp)
    },
    create: (req, res) => app.Promise.resolve(app.auth.AddUserPermission(
      req.matchedData.userId, req.matchedData.object, req.matchedData.permission,
      req.matchedData.kind || kindAllow))
  }
}
