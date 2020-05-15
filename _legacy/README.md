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
* multiple storages:
    * in-memory JSON storage
    * in-memory sqlite3 storage
    * sqlite3 database storage

## Planned features
* Joi based object schema validation
* social login via Facebook, Google, Instagram, Vk
* Manage actions in system (action list - protocol)
* Unified storage architecture (common service code for different storage adapters - "generic-xx" based)
* car management feature
* car garage feature

## Documentation:

* System:
    * models
    * API endpoints
* Domain-specific:
    * models
    * API endpoints

