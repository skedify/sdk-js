import createResourceDescription from './util/createResourceDescription'

export const employees = createResourceDescription('employees', {
  includes: ['user', 'enterprise'],
  filters: ['email', 'external_id'],
})
