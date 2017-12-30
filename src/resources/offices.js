import createResourceDescription from './util/createResourceDescription'

export const offices = createResourceDescription(
  'offices',
  {
    includes: ['subject_settings', 'contacts', 'contacts.subjects'],
    filters: [
      'external_id',
      'schedulable_for_subject',
      'schedulable_with_contact',
      'schedulable',
    ],
  },
  {
    subjectSettings: createResourceDescription('subject_settings', {
      filters: ['subject_id'],
    }),
  }
)
