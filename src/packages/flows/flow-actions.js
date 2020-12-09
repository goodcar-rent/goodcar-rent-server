export const actions = {
  userCount: {
    name: 'userCount',
    models: ['User'],
    output: 'count',
    fn: (stCtx) => stCtx.models.User.count()
      .then(count => {
        stCtx.count = count
        return stCtx
      })
  },
  userFindByEmail: {
    name: 'userFindByEmail',
    models: 'User',
    input: '!email',
    output: 'user',
    fn: (stCtx) => stCtx.models.User.findOne({ where: { email: stCtx.email } })
      .then((_user) => {
        stCtx.user = _user
        return _user
      })
  },
  userCheckIsFound: {
    name: 'userCheckIsFound',
    input: 'user',
    fn: (stCtx) => {
      if (!stCtx.user) {
        throw new Error('user not found')
      }
      return Promise.resolve(stCtx)
    }
  },
  adminAdd: {
    name: 'adminAdd',
    input: '!user',
    services: 'access',
    fn: (stCtx) => stCtx.services.access.addAdmin(stCtx.user)
  },
  userCreate: {
    name: 'userCreate',
    input:
  '!user',
    output:
  '!user',
    models:
  'User',
    fn: (stCtx) => stCtx.models.User.create(stCtx.user)
      .then((_user) => {
        stCtx.user = _user
        return _user
      })
      .catch((e) => { throw e })
  },
  checkDomain: {
    name: 'checkDomain',
    input: '!email',
    output: '!domain',
    models: 'UserDomain',
    services: 'mailer',
    fn: (stCtx) => {
      if (!process.env.AUTH_SIGNUP_CHECK_DOMAIN) {
        console.log('no domain check')
        return Promise.resolve()
      }
      const { domain } = stCtx.services.mailer.parser.parseOneAddress(stCtx.email)
      if (!domain) {
        console.log('parse failed')
        const e = new Error(`checkDomain: failed to parse email ${stCtx.email}`)
        e.status = 400
        throw e
      }
      return stCtx.models.UserDomain.findOne({ where: { domain } })
        .then((_userDomain) => {
          if (!_userDomain) {
            const e = new Error(`checkDomain: domain ${domain} not registered! Reject`)
            e.status = 403
            throw e
          }
          if (_userDomain.isAllow === false) {
            const e = new Error(`checkDomain: domain ${domain} restricted`)
            e.status = 403
            throw e
          }
          stCtx.domain = _userDomain
          return Promise.resolve()
        })
        .catch(e => { throw e })
    }
  },
  userGroupAddUserToGroups: {
    name: 'userGroupAddUserToGroups',
    input: ['user', { name: 'groups', type: 'array' }],
    services: ['serial'],
    models: 'UserGroup',
    fn: (stCtx) => {
      if (!stCtx.user.id) {
        throw Error('userGroupAddUserToGroups action: user.id not found')
      }

      return stCtx.services.serial(stCtx.groups.map((group) => () => {
        return stCtx.models.UserGroup.usersAdd(group, stCtx.user.id)
      }))
    }
  },
  nop: {
    name: 'nop',
    fn: (stCtx) => Promise.resolve(stCtx)
  },
  delay: {
    name: 'delay',
    input: 'ms',
    fn: (stCtx) => {
      return new Promise(resolve => setTimeout(resolve, stCtx.ms)).then(() => stCtx)
    }
  }
}
