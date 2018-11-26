# goodcar-rent-server

GoodCar.rent server app

## Already implemented features

* jwt tokens auth
* email/password login
* user groups
* email invites for registration with predefined user groups
* object/permission ACLs for users/user groups
* disable user login
* disable invite

## Planned features
* Joi based object schema validation
* social login via Facebook, Google, Instagram, Vk
* Manage actions in system (action list - protocol)
* multiple storages (WIP):
    * in-memory JSON storage
    * in-memory sqlite3 storage
    * sqlite3 database storage

## Models/Services

### ACL:

* id: ACL identifier
* permissions: [] array of permissions:
* permission: permission name, like "read", "write"
    * users: list of users that have this permission of this kind:
        * id: userId
        * kind: permission, one of ALLOW/DENY
    * userGroups: list of groups that have this permission of this kind

### Invite:

 * id : uuid
 * expireAt : date
 * registeredUser : -> User.id
 * disabled : boolean
 * email: invited to this email
 * assignUserGroups: [] array of user group Ids to assign for user created via this invite

### Login:

* id: login identifier, UUID
* userId: -> User.id: user, associated with this login
* createdAt: date of logging-in
* ip: IP address of user's endpoint
  
### User:

* id: user identifier, UUID
* email: email, that user choose for registering
* password: hashed password
* invitedBy: -> User.id: user that created invite
* inviteDate: date of invite
* inviteId -> Invite.id: link to invite
* disabled: if user account is disabled

### UserGroup:

* id
* name
* systemType: null, Admin, Guest, LoggedIn
* users: [User]

System types:

* Null: all members are defined by users, not system
* Admin: system type for admin user (first user in system at least) - manually can be added other user accounts
* Guest: not authenticated user
* LoggedIn: Authenticated users (any - admin, other users)

### ACL priorities

If no ACL is defined, then user access will be DENY.

Lowerst priority is for group permissions

User-specific permissions have priority over group permissions.

## Endpoints

### ACL routes:

> GET /acl/user/:userId

Returns list of ACL objects defined in system for specified user

> POST /acl/user/:userId

Define ACL object with permissions for specified users

> GET /acl/user-group/:groupId

Returns list of ACLs for specified user group

> POST /acl/user-group/:groupId

Define ACLs for user group

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

> GET /user-group/:id/users

List users in this usergroup

> POST /user-group/:id/users

Add user to usergroup

> DELETE /user-group/:id/users/:userId

Delete single user from group

> DELETE /user-group/:id/users

Delete specified list of users from group

### User router:

> GET /user

Return list of users in system 

> POST /user 

Add user tp system

> GET /user/:userId

Get user profile

> PUT /user/:userId

Update user profile

### User permissions routes:

> GET /user/:userId/permissions

List all defined permission for this user

> POST /user/:userId/permissions

Create new permission for specified user

### User login routes:

> GET /user/:userId/logins

List logins of this user

> GET /user/:userId/logins/:loginId

Get details of logins for specified user

> DELETE /user/:userId/logins/:loginId

Manually log-off specified user

### Me routes:

> GET /me

Return profile of currently logged-in user

> GET /me/permissions

List ACL permissions for currently logged-in user

### Car management routes

#### GET /car

> Return 

## TODO: 

GET /login/:provider - return redirect page with login via provider (Instagram, Google, Facebook, Vk)
POST /login/:provider - accept access token from social provider to login

GET /me/social - list of linked social profiles for current user

POST /me/social/:provider - link social profile with current user

DELETE /me/social/:provider - unlink social profile

GET /social - list of supported social providers (google, instagram, facebook)

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
