import createResourceDescription from './util/createResourceDescription'

export const calendarEventTemplates = createResourceDescription(
  'calendar_event_templates',
  {
    includes: ['language'],
  }
)
