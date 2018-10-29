# goodcar-rent-server

GoodCar.rent server app

## Already implemented features

* jwt tokens auth
* email/password login
* email invites for registration

## Planned features

* ACL for user groups, objects with flexible permission schemas
* social login via Facebook, Google, Instagram, Vk


## Endpoints

### ACL routes:

> GET /acl/object

Returns list of ACL objects defined in system

> POST /acl/object

Define ACL object with permissions for specified users

### Auth routes:

> POST /auth/signup

Create new user profile in system

> POST /auth/login
 
Login via email/password

> GET /auth/signup (html) ?invite=code

Return signup page with hidden field "invite"
 
### Invite routes:
 
> POST /auth/invite

Create invite for new user
  
> GET /auth/invite

Return list of invites in system

> GET /auth/invite/:id

Get specified invite

> DELETE /auth/invite:id
  
Delete specified invite

> POST /auth/invite/:id/send

Send invite for specified user

### Login routes

> GET /login

Return list of active login (sessions) for current system

> GET /login/:id 

Return data about active login

> DELETE /login/:id

Remove active login session (force specified user session to logout)

### UserGroup router

> GET /user-group

Return list of user groups 

> POST /user-group

Create new user group

> GET /user-group/:id

Return info about specified user group

> PUT /user-group/:id

Update info about user group

> DELETE /user-group/:id

Delete user group from system

### User router:

> GET /user

Return list of users in system 

> POST /user 

Add user tp system

> GET /user/:userId

Get user profile

> PUT /user/:userId

Update user profile

### User permissions routes (WIP):

> GET /user/:userId/permissions

List all defined permission for this user

> POST /user/:userId/permissions

Create new permission for specified user

> GET /user/:userId/permissions/:permissionId

Get info about specific permission for this user

> PUT /user/:userId/permissions/:permissionId

Update info about specific permission for this user

> DELETE /user/:userId/permissions/:permissionId

Delete specific permission for this user

### User login routes:

> GET /user/:userId/logins

List logins of this user

> DELETE /user/:userId/logins/:loginId

Manually log-off specified user


### Car management routes

#### GET /car

> Return 

## TODO: 

GET /login/:provider - return redirect page with login via provider (Instagram, Google, Facebook, Vk)
POST /login/:provider - accept access token from social provider to login

GET /me - return profile of currently logged user

GET /me/social - list of linked social profiles for current user

POST /me/social/:provider - link social profile with current user

DELETE /me/social/:provider - unlink social profile

GET /social - list of supported social providers (google, instagram, facebook)

## Feature proposals

> all /user routes requires "Admin" permissions

### GET /user

> Return list of users in system

### POST /user

> Create new user profile (same as /signup, but require admin perms)

### DELETE /user/:id

> Delete user profile from system

### UPDATE /user/:id

> Modify user profile

### GET /user-group

> Return list of user groups in system

## ACL routes (WIP)

> GET /acl/object

List all objects in system

> POST /acl/object

Add new object to system

> GET /acl/object/:id

Get detail info about object

> POST /acl/object/:id

Update info about object

> DELETE /acl/object/:id

Delete object from system

> GET /acl/object/:id/permission

List of all permission associated with object

> GET /acl/object/:id/permission/:permissionId/users

List of users with this permission

> GET /acl/object/:id/permission/:permissionId/user-groups

List of all user groups with this permission

## System features

* Manage login sessions for users in system (list sessions, disconnect user
* Disable user login
* Manage actions in system (action list - protocol)

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

