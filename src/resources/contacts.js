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
  }
)
