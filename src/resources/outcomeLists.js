import createResourceDescription from './util/createResourceDescription'

export const outcomeLists = createResourceDescription('outcome_lists', {
  includes: ['outcome_outcome_lists', 'outcomes'],
})
