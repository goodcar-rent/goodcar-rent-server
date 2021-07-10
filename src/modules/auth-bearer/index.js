export default (app, opt) => {
  return {
    initSync: (app, opt) => {},
    init: async (app, opt) => Promise.resolve()
  }
}
