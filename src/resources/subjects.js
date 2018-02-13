import createResourceDescription from './util/createResourceDescription'

export const subjects = createResourceDescription(
  'subjects',
  {
    includes: [
      'questions',
      'subject_category',
      'languages',
      'languages.translations',
    ],
    filters: [
      'category_id',
      'external_id',
      'schedulable_at_office',
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
    }),
  }
)
