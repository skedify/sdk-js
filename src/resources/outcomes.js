import createResourceDescription from './util/createResourceDescription'

export const outcomes = createResourceDescription('outcomes', {
  includes: ['appointments', 'outcome_lists', 'outcome_outcome_lists'],
})
