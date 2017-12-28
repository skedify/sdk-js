import createResourceDescription from '.'

export const customers = createResourceDescription('customers', {
  filters: ['external_id', 'match', 'limit'],
})
