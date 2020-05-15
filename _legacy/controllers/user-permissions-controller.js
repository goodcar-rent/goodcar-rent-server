export default module.exports = (app) => {
  // const Model = app.models.User

  return {
    permissionsList: (req, res) =>
      app.auth.ListACLForUser(req.params.userId)
        .then((resp) => {
          res.json(resp)
          return Promise.resolve(resp)
        })
        .catch((err) => Promise.reject(err)),

    permissionsCreate: (req, res) => {
      res.json.sendStatus(200)
      return app.auth.AddUserPermission(req.params.userId, req.matchedData.object,
        req.matchedData.permission, req.matchedData.kind || app.consts.kindAllow)
        .catch((err) => Promise.reject(err))
    }
  }
}
