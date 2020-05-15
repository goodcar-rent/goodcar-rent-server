import FacebookStrategy from 'passport-facebook'
import GoogleStrategy from 'passport-google-oauth20'
import InstagramStrategy from 'passport-instagram'

// Transform Facebook profile because Facebook and Google profile objects look different
// and we want to transform them into user objects that have the same set of attributes
const transformFacebookProfile = (profile) => ({
  name: profile.name,
  avatar: profile.picture.data.url
})

// Transform Google profile into user object
const transformGoogleProfile = (profile) => ({
  name: profile.displayName,
  avatar: profile.image.url
})

const transformInstagramProfile = (profile) => ({
  name: profile.displayName,
  avatar: profile._json.data.profile_picture
})

export default (passport) => {
  // Register Facebook Passport strategy
  passport.use(
    new FacebookStrategy({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: 'http://localhost:3000/auth/facebook/callback',
      profileFields: ['id', 'name', 'displayName', 'picture', 'email']
    },
    // Gets called when user authorizes access to their profile
    async (accessToken, refreshToken, profile, done) => done(null, transformFacebookProfile(profile._json))
    // Return done callback and pass transformed user object))
    )
  )

  // Register Google Passport strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:3000/auth/google/callback'
      },
      async (accessToken, refreshToken, profile, done) => done(null, transformGoogleProfile(profile._json))
    )
  )

  // Register Instagram Passport strategy
  passport.use(
    new InstagramStrategy(
      {
        clientID: process.env.INSTAGRAM_CLIENT_ID,
        clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
        callbackURL: 'http://127.0.0.1:3000/auth/instagram/callback'
      },
      async (accessToken, refreshToken, profile, done) => done(null, transformInstagramProfile(profile))
    )
  )
  return passport
}
