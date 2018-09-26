import { body, query } from 'express-validator/check'
import AuthController from '../controllers/auth-controller'

export default (app) => {
  const router = app.express.Router()
  const controller = AuthController(app)

  // noinspection JSCheckFunctionSignatures
  router.post(
    '/login',
    [
      body('email').isEmail().withMessage('Email should be provided'),
      body('password').isLength({ min: 1 }).withMessage('Password should be specified'),
    ],
    app.wrap(controller.login))

  // noinspection JSCheckFunctionSignatures
  router.post(
    '/signup',
    [
      body('name').isLength({ min: 1 }).withMessage('Name should be specified'),
      body('email').isEmail().withMessage('Email should be specified'),
      body('password').isLength({ min: 1 }).withMessage('Password should be specified'),
      body('isAdmin').optional().isBoolean(),
      body('invite').optional().isString()
    ],
    app.wrap(controller.signup))

  // return login page
  router.get('/signup',
    [
      query('invite').optional().isString()
    ],
    app.wrap(controller.signupPage))

  /*
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
  */
  return router
}
