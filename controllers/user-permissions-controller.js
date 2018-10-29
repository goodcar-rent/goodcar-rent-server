export default module.exports = (app) => {
  // const Model = app.models.User

  return {
    permissionsList: (req, res) => app.Promise.resolve(res.json(app.auth.ListACLForUser(req.params.userId))),
    permissionsCreate: (req, res) => {
      res.json.sendStatus(200)
      return app.Promise.resolve(app.auth.AddUserPermission(
        req.params.userId, req.matchedData.object, req.matchedData.permission,
        req.matchedData.kind || app.auth.kindAllow))
    },
    permissionsItem: (req, res) => {},
    permissionsSave: (req, res) => {},
    permissionsDelete: (req, res) => {}
  }
}
