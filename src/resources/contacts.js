import createResourceDescription from './util/createResourceDescription'

export const contacts = createResourceDescription(
  'contacts',
  {
    includes: [
      'appointments',
      'contact_office_subjects',
      'contact_office_subjects.subject',
      'contact_office_subjects.subject.subject_category',
      'contact_offices',
      'contact_offices.office',
      'offices',
      'subjects.subject_category',
      'subjects',
      'user',
    ],
    filters: ['offices', 'schedulable'],
  },
  {
    appointments: createResourceDescription('appointments', {
      includes: [
        'accepted_possibility',
        'customer',
        'possibilities',
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
        includes: [
          'day_time_slots',
          'day_time_slots.availability_settings',
          'day_time_slots.offices',
          'day_time_slots.subjects',
        ],
      },
      {
        dayTimeSlots: createResourceDescription(
          'day_time_slots',
          {
            includes: [
              'availability_settings', // This is a shorthand to include `contact_office_availability_settings` and `contact_office_subject_availability_settings`
              'contact_office_availability_settings',
              'contact_office_subject_availability_settings',
              'offices',
              'subjects',
            ],
          },
          {
            contactOfficeAvailabilitySettings: createResourceDescription(
              'contact_office_availability_settings',
              {
                includes: ['contact_office'],
              }
            ),
            contactOfficeSubjectAvailabilitySettings: createResourceDescription(
              'contact_office_subject_availability_settings',
              {
                includes: [
                  'contact_office_subject',
                  'contact_office_subject.office',
                  'contact_office_subject.subject',
                ],
              }
            ),
          }
        ),
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
        includes: [
          'week_time_slots',
          'week_time_slots.availability_settings',
          'week_time_slots.offices',
          'week_time_slots.subjects',
        ],
      },
      {
        weekTimeSlots: createResourceDescription(
          'week_time_slots',
          {
            includes: [
              'availability_settings', // This is a shorthand to include `contact_office_availability_settings` and `contact_office_subject_availability_settings`
              'contact_office_availability_settings',
              'contact_office_subject_availability_settings',
              'offices',
              'subjects',
            ],
          },
          {
            contactOfficeAvailabilitySettings: createResourceDescription(
              'contact_office_availability_settings',
              {
                includes: ['contact_office'],
              }
            ),
            contactOfficeSubjectAvailabilitySettings: createResourceDescription(
              'contact_office_subject_availability_settings',
              {
                includes: [
                  'contact_office_subject',
                  'contact_office_subject.office',
                  'contact_office_subject.subject',
                ],
              }
            ),
          }
        ),
      }
    ),
  }
)
