// Placeholder OhmySelect contact endpoints used for assistance and booking
// requests. Swap for real values (or a backend) later.
export const WHATSAPP_NUMBER = '84900000000' // international format, no '+'
export const SUPPORT_EMAIL = 'hello@ohmyselect.com'

export function whatsappLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

export function mailtoLink(subject, body) {
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
