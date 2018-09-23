import sgMail from '@sendgrid/mail'
import { markdown, plaintext } from './markdown'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const msg = {
  from: 'noreply@goodcar.rent'
}

export default (to, subject, message) =>
  sgMail.send(_.merge(msg, { to, subject, text: plaintext(message), html: markdown(message) }))
