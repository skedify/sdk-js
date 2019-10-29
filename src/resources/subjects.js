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
      'outcome_list',
      'outcome_list.outcomes',
      'outcome_list.outcome_outcome_lists',
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
