import createResourceDescription from '.'

export const subjectCategories = createResourceDescription(
  'subject_categories',
  {
    includes: ['languages', 'languages.translations'],
  }
)
