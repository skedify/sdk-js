import createResourceDescription from './util/createResourceDescription'

export const events = createResourceDescription('events', {
  requires_domain_map: true,
  filters: ['calendar', 'before', 'after', 'availability', 'sync_availability'],
  enable_pagination: false,
})
