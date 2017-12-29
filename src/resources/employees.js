import createResourceDescription from '.'

export const employees = createResourceDescription('employees', {
  filters: ['email', 'external_id'],
  includes: ['user', 'enterprise'],
})
