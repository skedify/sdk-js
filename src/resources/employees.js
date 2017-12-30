import createResourceDescription from './util/createResourceDescription'

export const employees = createResourceDescription('employees', {
  filters: ['email', 'external_id'],
  includes: ['user', 'enterprise'],
})
