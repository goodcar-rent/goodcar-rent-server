/**
 * Services module:
 * serial
 * isPromise
 * exWrap (?)
 */
const promiseSerial = funcs =>
  funcs.reduce((promise, func, index) => {
    // console.log(`serial ${index}`)
    return promise.then(result =>
      func().then(Array.prototype.concat.bind(result)))
  }, Promise.resolve([]))

const isPromise = function (p) {
  return p && typeof p.then === 'function' && typeof p.catch === 'function'
}

export default (app, opt) => {
  return {
    initSync: (app, opt) => {},
    init: (app, opt) => Promise.resolve(),
    serial: promiseSerial,
    isPromise
  }
}
