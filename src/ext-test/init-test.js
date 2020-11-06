/**

 exModular project

 Test module

 This module initialize test data from seed - it loads some data into Note model used in tests

*/

export const InitExtTest = (app) => () => {
  console.log('init ext-test:')
  return app.exModular.services.seed('Note', 'test-note.json')
    // .then(() => app.exModular.services.seed('FinPlan', 'fin-plan.json', { upsert: true }))
    .catch((e) => { throw e })
}
