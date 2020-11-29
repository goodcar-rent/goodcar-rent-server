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

## Filter

Filter types:
* special q filter
* simple values: json object
* conditional filter: json object with suffixes for keys _lt, _lte, _gt, _gte

/route?filter=q:some%20text
/route?filter={someprop: somvalue}
/route?filter={someprop_gte: somevalue, someOtherProp_lt: otherValue}

## Flow

flow - потоки выполнения, набор команд, которые может выполнить система. Некий аналог скрипта. Состоит из отдельных шагов.

statement (st) - отдельный шаг в потоке выполнения. Аналогичен строке кода в скрипте. Шаг может быть разных типов - или действие (action), или условным (if).

action -  действие. Аналог вызова функции в скриптовых языках. Для работы с параметрами вызова, передаче результата, использования глобальных переменных используются контексты.

ctx - контекст. Контекст бывает глобальный (общий для всего потока действий), и контекст действия. Контекст действия готовится для каждого st отдельно.  

API сервиса flow монтируются на exModular.flow:

* `flows`: `{Object}` : потоки выполнения в системе, записаны под своими именами, имя - ключ в этом объекте
* `add(name, flow)`: `fn` : добавить указанный flow под именем name в объект flows
* `actions`: `[Array]` : массив действий, определенных в системе.
* `processAllActions()`: `fn` : метод, который инициализирует все действия, создает у них обязательные переменные input, output и производит импорт моделей (.models) и сервисов (.services), которые использует данное действие. На момент вызова действия гарантируется, что импорт выполнен.
* `run(flowName, flowCtx)`: `fn` : метод для запуска действия по имени. Можно передать начальный контекст. Возвращает Promise с контекстом на момент завершения выполнения потока действий.
* `prepareActionCtx(action, stCtx)`: `fn` : метод для подготовки контекста действия
* `runSt(flow, ctx)`: `fn` : выполнить шаг из потока. Номер шага должен быть указан в `ctx.flow.ndx`
