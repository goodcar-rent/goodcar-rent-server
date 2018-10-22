import { kindAllow } from '../services/acl'


export default module.exports = (app) => {
  return {
    list: (req, res) => res.json(app.auth.ListACL()),
    create: (req, res) => app.Promise.resolve(app.auth.AddUserPermission(
      req.matchedData.userId, req.matchedData.object, req.matchedData.permission,
      req.matchedData.kind || kindAllow))
  }
}
