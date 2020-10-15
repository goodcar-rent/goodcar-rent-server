import { v4 as uuid } from 'uuid'
import moment from 'moment'

export const FinData = (app) => {
  const Model = {
    name: 'FinData',
    caption: 'Данные',
    description: 'Финансовые данные для расчёта БДДС, в разных форматах',
    props: [
      {
        name: 'id',
        type: 'id',
        caption: 'Идентификатор',
        description: 'Идентификатор',
        default: () => uuid(),
        calculated: true
      },
      {
        name: 'csv',
        type: 'text',
        format: 'text',
        size: (1024 * 8),
        caption: 'CSV',
        description: 'Данные в формате CSV',
        default: null,
        calculated: true
      }
    ]
  }

  Model.list = (req, res) => {
    var finOp = ''

    return Promise.resolve()
      .then(() => {
        const FinOp = app.exModular.models.FinOp

        return FinOp.findAll()
      })
      .then((_finOp) => {
        if (!_finOp) {
          throw new Error('FinOp.list: failed to fetch finOp records from DB')
        }
        finOp = _finOp
        console.log('data fetched:')
        return (res.data = finOp.map((item) => {
          if (item.date) {
            const aDate = moment(item.date)
            item.dateAsYM = aDate.format('YYYY-MM')
          } else {
            item.dateAsYM = ''
          }
        }))
      })
      .catch((e) => { throw e })
  }

  return Model
}
