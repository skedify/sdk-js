import createResourceDescription from './util/createResourceDescription'

export const calendars = createResourceDescription(
  'calendars',
  {
    includes: ['sync_account'],
    filters: ['id'],
  },
  {
    events: createResourceDescription('events', {
      requires_domain_map: true,
    }),
  }
)
