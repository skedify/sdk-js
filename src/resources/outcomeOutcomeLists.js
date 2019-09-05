import createResourceDescription from './util/createResourceDescription'

export const outcomeOutcomeLists = createResourceDescription(
  'outcome_outcome_lists',
  {
    includes: ['outcome', 'outcome_list'],
  }
)
