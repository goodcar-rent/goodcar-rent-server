export default (app, opt) => {
  return {
    initSync: (app, opt) => {},
    init: (app, opt) => Promise.resolve()
  }
}
