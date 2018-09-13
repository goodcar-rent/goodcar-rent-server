import _ from 'lodash'

const _users = []

export const User = {
  findById: (id) => _.find( _users, {id})
}