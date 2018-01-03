import createResourceDescription from './util/createResourceDescription'

export const customers = createResourceDescription('customers', {
  filters: ['external_id', 'match', 'limit'],
})
