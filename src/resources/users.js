import createResourceDescription from './util/createResourceDescription'

export const users = createResourceDescription(
  'users',
  {
    includes: ['employees', 'sync_accounts'],
  },
  {
    syncAccounts: createResourceDescription('sync_accounts'),
    events: createResourceDescription('events', {
      filters: ['start', 'end', 'split', 'group_by'],
    }),
    employees: createResourceDescription('employees', {
      includes: ['roles'],
    }),
    calendars: createResourceDescription(
      'calendars',
      {
        includes: ['sync_accounts'],
        filters: ['is_sync_availability'],
      },
      {
        events: createResourceDescription('events', {
          filters: ['start', 'end', 'split', 'group_by'],
        }),
      }
    ),
  }
)
