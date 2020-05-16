import fs from 'fs'
import path from 'path'

export const Seed = (app) => {
  const Service = (modelName, fileName, opt) => {
    if (!opt) {
      opt = {}
    }
    opt.onlyIfEmpty = opt.onlyIfEmpty || true
    opt.upsert = opt.upsert || true

    // eslint-disable-next-line no-useless-catch
    try {
      if (!fs.existsSync(fileName)) {
        fileName = path.join(process.env.SEEDS_DIR, fileName)
      }

      const data = JSON.parse(fs.readFileSync(fileName).toString())
      const Model = app.exModular.models[modelName]

      if (!Model) {
        throw Error(`Seed: model ${modelName} not found in app`)
      }

      return Promise.resolve()
        .then(() => {
          if (opt.onlyIfEmpty) {
            // proceed with checking if database is empty
            return Model.count()
              .then((count) => {
                if (count === 0) {
                  return Promise.all(data.map((item) =>
                    Model.create(item)
                      .catch((e) => { throw e })
                  ))
                }
              })
          } else if (opt.upsert) {
            // if upsert is true, then refresh data:
            return Promise.all(data.map((item) =>
              Model.findById(item.id)
                .then((found) => {
                  if (!found) {
                    return Model.create(item)
                  }
                  return Model.update(item.id, item)
                })
                .catch((e) => { throw e })
            ))
          } else {
            return Promise.all(data.map((item) =>
              Model.create(item)
                .catch((e) => { throw e })
            ))
          }
        })
    } catch (e) {
      throw e
    }
  }

  return Service
}
