# ExModular project

ExModular is Express-based app toolkit with features:

* declarative module system for models, routes, controllers
* user, userGroup 
* password auth
* JWT tokens
* sessions
* route permissions: individual user or userGroups
* storage (knex-based) with some ORM for typed access to data objects
* app init with seeding system and sample data 

## Declarative module system

Declaratively define models, routes, controllers.

## exModular.services

Services API:

* controller
* errors
* mailer
* codegen
* serial
* validator
* wrap


## Storage-knex

### findAll(opt)

opt:
* where: `object`: k-v pairs of field / value
* whereOp: `array`: [{ column, op, value }]
* whereIn: `array`: [{ column, ids }]
* orderBy: `array`: [{ column, order: 'asc/desc' }]

## Access-Simple

Модуль для регистрации простого доступа в системе

API:

* registerLoggedUser (user): зарегистрировать вошедшего в систему пользователя
* unregisterLoggedUser (user): зарегистрировать выход пользователя из системы
* addAdmin(user): добавить пользователя к группе администраторов

## Auth-JWT

Модуль для авторизации посредством JWT

Auth-JWT API:

* encode (sessionId): закодировать идентификатор сессии в JWT, вернуть JWT  
* getTokenFromReq (req): получить из заголовка авторизации структуру { scheme: , token: } 
* check (req, res, next): миддлваре для проверки авторизации - получить токен из запроса, декодировать и проверить его, поместить в req.user.jwt, загрузить сессию в req.user.session, загрузить профиль пользователя в req.user. При ошибке продолжить с ошибкой ServerNotAllowed. 

## Auth-password

Модуль для входа в систему посредством логина и пароля

Auth-password API:

* module.login(req, res): контроллер для роута входа в систему.
* module.logout(req, res): контроллер для маршрута выхода их системы
* module.routes: определенные маршруты (/auth/login, auth/logout)

## Model definition

Модели в системе описываются декларативным путем.

Model.key - содержит название поля-идентификатора записи
Model.props -  массив, содержит описание полей в следующем формате:

* name:
* type:
* format:
* default:
* caption:
* beforeSave: 
* getter
* calculated

Model.resourcePath: на какой маршрут монтировать 
 
Типы свойств (prop type):
* `array`: `.itemType` указывает тип элементов - поддерживается только `(decimal, id)`
* `refs`: массив ссылок на элементы, нужно ещё указать `.model` - на какую модель ссылаемся
* `ref`: ссылка на элемент в другой модели `.model`
* `decimal`: `.precision` знаков всего и `.scale` знаков после запятой
* `text`: строка текста, размер можно задать свойством `.size`, формат задаётся свойством `.format` (string, date, email, name, ...)

