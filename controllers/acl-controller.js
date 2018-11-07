export default module.exports = (app) => {
  return {
    list: (req, res) => {
      const resp = app.auth.ListACLForUserSync(req.params.userId)
      res.json(resp)
      return Promise.resolve(resp)
    },
    create: (req, res) => {
      const resp = app.auth.AddUserPermission(
        req.params.userId, req.matchedData.object, req.matchedData.permission,
        req.matchedData.kind || app.auth.kindAllow)
      res.json(resp)
      return Promise.resolve(resp)
    },
    userGroupCreate: (req, res) => {
      const resp = app.auth.AddGroupPermission(
        req.params.groupId, req.matchedData.object, req.matchedData.permission,
        req.matchedData.kind || app.auth.kindAllow)
      res.json(resp)
      return Promise.resolve(resp)
    },
    userGroupListACL: (req, res) => {
      const resp = app.auth.ListACLForUserGroupSync(req.params.groupId)
      res.json(resp)
      return Promise.resolve(resp)
    }
  }
}
