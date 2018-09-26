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

### GET /auth/login (html)
 ?invite=code
 
 Return login page with hidden field "invite"
 
### POST /auth/invite

Create invite for new user
  
### GET /auth/invite

Return list of pending invites in system

### DELETE /auth/invite:id
  
Delete specified invite

### GET /auth/invite/:id

Get specified invite

### POST /auth/invite/:id/send

Send invite for specified user

## TODO: 

GET /login/:provider - return redirect page with login via provider (Instagram, Google, Facebook)
POST /login/:provider - accept access token from social provider to login

GET /me - return user profile

GET /me/social - list of linked social profiles

POST /me/social/:provider - link social profile

DELETE /me/social/:provider - unlink social profile

GET /social - list of supported social providers (google, instagram, facebook)

## Feature proposals

### ACL: Access control

Access control allow to set separate permissions for group of users

API:

* we should have some Express middleware to check if this route allowed or not
* special role for Guest: not authenticated group of users
* special role for Admin: all permissions automatically
* user routes: /me profile, /users for manage users for Admins, POST user with admin permissions;
* user group route: /group

### ACL testcase

* car list: 
    * Guest can read
    * Emp can readwrite
    * Manager can read/write/grant 
* car booking:
    * Guest can NOT read
    * Emp can read/write
    * Manager can write
* users:
    - admin
    - emp 1
    - emp 2
    - manager
* groups:
    - guest
    - admin
    - loggedIn
    - management
    - emp
* domains/objects:
    - car management
        - car list
        - car features
    - car booking
* permissions: any string identifier

     
### Allow algorithm

Get user group

Get all permissions for group

Get all permissions for account

Check if permission for this object is ok

### System default permissions

Auth domain:
    "POST /auth/login": GUEST
    "POST /auth/signup": GUEST
    "POST /auth/invite": LOGGEDIN
    "GET /auth/invite": LOGGEDIN
    "" 