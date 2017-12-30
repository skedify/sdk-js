import createResourceDescription from './util/createResourceDescription'

export const contacts = createResourceDescription('contacts', {
  includes: [
    'user',
    'offices',
    'offices.subject_settings',
    'subjects',
    'subjects.subject_category',
    'appointments',
  ],
  filters: ['offices', 'schedulable'],
})
