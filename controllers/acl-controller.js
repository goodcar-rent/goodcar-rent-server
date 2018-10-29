export default module.exports = (app) => {
  return {
    list: (req, res) => {
      const resp = app.auth.ListACL()
      return res.json(resp)
    },
    create: (req, res) => {
      console.log('create:')
      console.log(req.matchedData.userId)
      console.log(req.matchedData.object)
      console.log(req.matchedData.permission)
      console.log(req.matchedData.kind)
      return app.Promise.resolve(
        app.auth.AddUserPermission(
          req.matchedData.userId, req.matchedData.object, req.matchedData.permission,
          req.matchedData.kind || app.auth.kindAllow))
    }
  }
}
