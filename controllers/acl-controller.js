export default module.exports = (app) => {
  return {
    list: (req, res) => {
      const resp = app.auth.ListACLForUserSync(req.matchedData.userId)
      res.json(resp)
      return Promise.resolve(resp)
    },
    create: (req, res) => {
      const resp = app.auth.AddUserPermission(
        req.matchedData.userId, req.matchedData.object, req.matchedData.permission,
        req.matchedData.kind || app.auth.kindAllow)
      res.json(resp)
      return Promise.resolve(resp)
    },
    userGroupCreate: (req, res) => {
      const resp = app.auth.AddGroupPermission(
        req.matchedData.groupId, req.matchedData.object, req.matchedData.permission,
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
