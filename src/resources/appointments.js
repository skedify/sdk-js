import createResourceDescription from '.'

export const appointments = createResourceDescription(
  'appointments',
  {
    includes: [
      'subject',
      'subject.subject_category',
      'office',
      'customer',
      'contact',
      'contact.employee',
      'contact.user',
      'possibilities',
      'possibilities.created_by',
      'accepted_possibility',
      'answers',
      'initiated_by',
    ],
    filters: ['state', 'start', 'end'],
  },
  {
    answers: createResourceDescription('answers', {
      includes: ['question'],
    }),
    possibilities: createResourceDescription('possibilities'),
  }
)
