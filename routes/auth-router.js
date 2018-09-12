export default (app) => {
  const router = app.express.Router()

  router.get('/facebook', app.passport.authenticate('facebook'))
  router.get('/facebook/callback',
    app.passport.authenticate('facebook', { failureRedirect: '/facebook' }),
    // Redirect user back to the mobile app using Linking with a custom protocol GoodCarRent
    (req, res) => res.redirect('GoodCarRent://login?provider=facebook&user=' + JSON.stringify(req.user)))

  router.get('/google', app.passport.authenticate('google', { scope: ['profile'] }))
  router.get('/google/callback',
    app.passport.authenticate('google', { failureRedirect: '/google' }),
    (req, res) => res.redirect('GoodCarRent://login?provider=google&user=' + JSON.stringify(req.user)))

  router.get('/instagram', app.passport.authenticate('facebook'))
  router.get('/instagram/callback',
    app.passport.authenticate('instagram', { failureRedirect: '/instagram' }),
    // Redirect user back to the mobile app using Linking with a custom protocol GoodCarRent
    (req, res) => res.redirect('GoodCarRent://login?provider=instagram&user=' + JSON.stringify(req.user)))

  return router
}
