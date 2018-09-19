# goodcar-rent-server

GoodCar.rent server app

## Features

* jwt tokens auth
* email/password login
* social login via linked social profiles: Facebook, Instagram, Google
* email invites for registration
* initial seed

## Endpoints

POST /auth/login - login via email/password
POST /auth/signup - create new user profile

## TODO: 

### GET /auth/login (html)
 ?invite=code
 
 Return login page with hidden field "invite"
 
### POST /auth/invite
  ?email=user@email.com 

Email invite for user

### DELETE /auth/invite
  ?email=user@email.com
  
### GET /auth/invite

Return list of pending invites in system

GET /login/:provider - return redirect page with login via provider (Instagram, Google, Facebook)
POST /login/:provider - accept access token from social provider to login

GET /me - return user profile

GET /me/social - list of linked social profiles

POST /me/social/:provider - link social profile

DELETE /me/social/:provider - unlink social profile

GET /social - list of supported social providers (google, instagram, facebook)

