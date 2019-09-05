import createResourceDescription from './util/createResourceDescription'

export const outcomeLists = createResourceDescription('outcome_lists', {
  includes: ['outcomes'],
})
