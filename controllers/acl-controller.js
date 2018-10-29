export default module.exports = (app) => {
  return {
    list: (req, res) => {
      const resp = app.auth.ListACL()
      return res.json(resp)
    },
    create: (req, res) => {
      res.json(
        app.auth.AddUserPermission(
          req.matchedData.userId, req.matchedData.object, req.matchedData.permission,
          req.matchedData.kind || app.auth.kindAllow))
    }
  }
}
