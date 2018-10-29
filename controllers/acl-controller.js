export default module.exports = (app) => {
  return {
    list: (req, res) => {
      const resp = app.auth.ListACL()
      res.json(resp)
      return Promise.resolve(resp)
    },
    create: (req, res) => {
      const resp = app.auth.AddUserPermission(
        req.matchedData.userId, req.matchedData.object, req.matchedData.permission,
        req.matchedData.kind || app.auth.kindAllow)
      res.json(resp)
      return Promise.resolve(resp)
    }
  }
}
