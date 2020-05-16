const promiseSerial = funcs =>
  funcs.reduce((promise, func, index) => {
    // console.log(`serial ${index}`)
    return promise.then(result =>
      func().then(Array.prototype.concat.bind(result)))
  }, Promise.resolve([]))

export const Serial = () => promiseSerial
