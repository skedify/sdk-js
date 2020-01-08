import createResourceDescription from './util/createResourceDescription'

export const events = createResourceDescription('events', {
  filters: ['calendar', 'before', 'after', 'availability', 'sync_availability'],
  enable_pagination: false,
})
