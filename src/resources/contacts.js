import createResourceDescription from './util/createResourceDescription'

export const contacts = createResourceDescription(
  'contacts',
  {
    includes: [
      'user',
      'offices',
      'offices.subject_settings',
      'subjects',
      'subjects.subject_category',
      'appointments',
    ],
    filters: ['offices', 'schedulable'],
  },
  {
    appointments: createResourceDescription('appointments', {
      includes: [
        'possibilities',
        'accepted_possibility',
        'customer',
        'subject',
      ],
    }),
    availability: createResourceDescription('availability', {
      includes: ['offices'],
      filters: ['office', 'start', 'end'],
    }),
    appliedWeekTemplates: createResourceDescription('applied_week_templates', {
      includes: ['week_template', 'week_template.week_time_slots'],
      filters: ['start', 'end', 'split'],
    }),
    appliedDayTemplates: createResourceDescription('applied_day_templates', {
      includes: ['day_template', 'day_template.day_time_slots'],
      filters: ['start', 'end'],
    }),
    dayTemplates: createResourceDescription(
      'day_templates',
      {
        includes: ['day_time_slots', 'day_time_slots.offices'],
      },
      {
        dayTimeSlots: createResourceDescription('day_time_slots', {
          includes: ['offices'],
        }),
      }
    ),
    subjects: createResourceDescription('subjects', {
      includes: ['questions'],
    }),
    offices: createResourceDescription(
      'offices',
      {},
      {
        availabilityHours: createResourceDescription('availability_hours'),
        availabilityHoursExceptions: createResourceDescription(
          'availability_hours_exceptions'
        ),
      }
    ),
    weekTemplates: createResourceDescription(
      'week_templates',
      {
        includes: ['week_time_slots', 'week_time_slots.offices'],
      },
      {
        weekTimeSlots: createResourceDescription('week_time_slots', {
          includes: ['offices'],
        }),
      }
    ),
  }
)
