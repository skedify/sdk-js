import createResourceDescription from './util/createResourceDescription'

export const subjects = createResourceDescription(
  'subjects',
  {
    includes: [
      'questions',
      'subject_category',
      'languages',
      'languages.translations',
      'lead_segments',
      'availability_settings',

      'completion_outcome_list',
      'completion_outcome_list.outcomes',
      'completion_outcome_list.outcome_outcome_lists',

      'customer_cancellation_outcome_list',
      'customer_cancellation_outcome_list.outcomes',
      'customer_cancellation_outcome_list.outcome_outcome_lists',

      'contact_cancellation_outcome_list',
      'contact_cancellation_outcome_list.outcomes',
      'contact_cancellation_outcome_list.outcome_outcome_lists',
    ],
    filters: [
      'category_id',
      'external_id',
      'lead_segment_code',
      'schedulable_at_office',
      'schedulable_for_meeting_type',
      'schedulable_with_contact',
      'schedulable',
    ],
  },
  {
    questions: createResourceDescription(
      'questions',
      {
        includes: ['options', 'languages', 'languages.translations'],
      },
      {
        languages: createResourceDescription('languages'),
        options: createResourceDescription('options'),
      }
    ),
    timetable: createResourceDescription('timetable', {
      filters: ['office', 'start', 'end', 'contacts'],
      deprecated: true,
    }),
    availabilitySettings: createResourceDescription('availability_settings'),
  }
)
