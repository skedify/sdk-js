import createResourceDescription from './util/createResourceDescription'

export const calendars = createResourceDescription('calendars', {
  includes: ['sync_account'],
  filters: ['id'],
})
