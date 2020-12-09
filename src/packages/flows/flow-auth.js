import { actions } from './flow-actions'
import { ST } from './flow-types'

export const authCheckDomain = [
  {
    action: actions.checkDomain,
    before: (ctx, stCtx) => {
      stCtx.user = ctx.data.user
    }
  }
]

export const authServiceIfAdmin = [
  {
    action: actions.adminAdd,
    before: (ctx, stCtx) => {
      stCtx.user = ctx.data.user
    },
    after: (ctx, stCtx) => {
      ctx.data.addedAsAdmin = true
    }
  }
]

export const authSignup = [
  {
    action: actions.userCount,
    after: (ctx, stCtx) => {
      ctx.data.userCount = stCtx.count
      ctx.data.addAsAdmin = (stCtx.count === 1)
    }
  },
  {
    action: actions.userFindByEmail,
    before: (ctx, stCtx) => {
      stCtx.email = ctx.http.req.body.email
    },
    after: (ctx, stCtx) => {
      if (stCtx.user) {
        throw new Error(`User with email ${stCtx.email} already registered`)
      }
    }
  },
  {
    action: actions.userCreate,
    before: (ctx, stCtx) => {
      stCtx.user = {
        name: ctx.http.req.body.name,
        email: ctx.http.req.body.email,
        password: ctx.http.req.body.password
      }
    },
    after: (ctx, stCtx) => {
      ctx.data.user = stCtx.user
    }
  },
  {
    type: ST.IF,
    condition: (ctx) => {
      return ctx.data.addAsAdmin
    },
    flow: 'Auth.Service._ifAdmin'
  },
  {
    action: actions.nop,
    after: (ctx, stCtx) => {
      ctx.http.res.body = ctx.data.user
      ctx.http.res.statusCode = 201
    }
  }
]
