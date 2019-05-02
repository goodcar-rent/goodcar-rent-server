export default module.exports = (app) => {
  return {
    list: (req, res) =>
      app.auth.ListACLForUser(req.params.userId)
        .then((resp) => {
          res.json(resp)
          return Promise.resolve(resp)
        })
        .catch((err) => Promise.reject(err)),
    create: (req, res) =>
      app.auth.AddUserPermission(req.params.userId, req.matchedData.object,
        req.matchedData.permission, req.matchedData.kind || app.consts.kindAllow)
        .then((resp) => {
          res.json(resp)
          return Promise.resolve(resp)
        })
        .catch((err) => Promise.reject(err)),
    userGroupCreate: (req, res) =>
      app.auth.AddGroupPermission(req.params.groupId, req.matchedData.object,
        req.matchedData.permission, req.matchedData.kind || app.consts.kindAllow)
        .then((resp) => {
          res.json(resp)
          return Promise.resolve(resp)
        })
        .catch((err) => Promise.reject(err)),
    userGroupListACL: (req, res) =>
      app.auth.ListACLForUserGroup(req.params.groupId)
        .then((resp) => {
          res.json(resp)
          return Promise.resolve(resp)
        })
        .catch((err) => Promise.reject(err))
  }
}
