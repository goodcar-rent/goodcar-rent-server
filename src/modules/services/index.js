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
  opt.initSync = (app, opt) => {}
  opt.init = async (app, opt) => Promise.resolve(opt)
  opt.serial = promiseSerial
  opt.isPromise = isPromise

  return opt
}
