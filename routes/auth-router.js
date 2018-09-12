export default (app) => {
  const router = app.express.Router()

  router.get('/facebook', app.passport.authenticate('facebook'))
  router.get('/auth/facebook/callback',
    app.passport.authenticate('facebook', { failureRedirect: '/auth/facebook' }),
    // Redirect user back to the mobile app using Linking with a custom protocol OAuthLogin
    (req, res) => res.redirect('OAuthLogin://login?user=' + JSON.stringify(req.user)))

  return router
}
