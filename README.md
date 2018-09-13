# goodcar-rent-server

GoodCar.rent server app

## Features

* jwt tokens auth
* email/password login
* social login via linked social profiles: Facebook, Instagram, Google
* email invites for registration
* initial seed

## endpoints

POST /auth - login via email/password

GET /auth/facebook - return info page with redirect to Facebook 
POST /auth/facebook - login via linked facebook account

GET /auth/:provider - return redirect page with login via provider
POST /auth/google - login via linked google account

POST /auth/instagram - login via linked instagram account

GET /me - return user profile

GET /me/social - list of linked social profiles

POST /me/social/:provider - link social profile

DELETE /me/social/:provider - unlink social profile

GET /social - list of supported social providers (google, instagram, facebook)

