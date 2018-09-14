# goodcar-rent-server

GoodCar.rent server app

## Features

* jwt tokens auth
* email/password login
* social login via linked social profiles: Facebook, Instagram, Google
* email invites for registration
* initial seed

## Endpoints

POST /login - login via email/password
POST /signup - create new user profile
GET /signup/invite - create new user rofilep via invite

GET /login/:provider - return redirect page with login via provider (Instagram, Google, Facebook)
POST /login/:provider - accept access token from social provider to login

GET /me - return user profile

GET /me/social - list of linked social profiles

POST /me/social/:provider - link social profile

DELETE /me/social/:provider - unlink social profile

GET /social - list of supported social providers (google, instagram, facebook)

