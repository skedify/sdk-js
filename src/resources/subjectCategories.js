import createResourceDescription from './util/createResourceDescription'

export const subjectCategories = createResourceDescription(
  'subject_categories',
  {
    includes: ['languages', 'languages.translations'],
  }
)
