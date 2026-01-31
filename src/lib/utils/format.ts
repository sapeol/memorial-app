import { format } from 'date-fns'

export function formatDateLong(date) {
  if (!date) return ''
  try {
    return format(new Date(date), 'MMMM d, yyyy')
  } catch (e) {
    return ''
  }
}

export function formatDateShort(date) {
  if (!date) return ''
  try {
    return format(new Date(date), 'MM/dd/yyyy')
  } catch (e) {
    return ''
  }
}

export function formatLifespan(birth, passing) {
  if (!birth && !passing) return ''
  const birthYear = birth ? new Date(birth).getFullYear() : '—'
  const passingYear = passing ? new Date(passing).getFullYear() : '—'
  return birthYear + ' — ' + passingYear
}