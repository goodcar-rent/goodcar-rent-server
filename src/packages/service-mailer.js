import sgMail from '@sendgrid/mail'
import _ from 'lodash'
import { markdown, plaintext } from './markdown'

const msg = {
  from: 'noreply@goodcar.rent'
}

const mail = (to, subject, message) =>
  sgMail.send(_.merge(msg, { to, subject, text: plaintext(message), html: markdown(message) }))

export const Mailer = (app) => {
  if (app.env.MAIL_API_KEY) {
    sgMail.setApiKey(process.env.MAIL_API_KEY)
  } else {
    throw Error('Expecting to have MAIL_API_KEY on app.env!')
  }
  return mail
}
