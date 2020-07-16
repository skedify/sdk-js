import createResourceDescription from './util/createResourceDescription'

export const calendars = createResourceDescription(
  'calendars',
  {
    includes: ['sync_account'],
    filters: ['id', 'is_sync_availability'],
  },
  {
    events: createResourceDescription('events', {
      requires_domain_map: true,
    }),
  }
)
