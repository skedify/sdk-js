import createResourceDescription from './util/createResourceDescription'

export const resourceCodes = createResourceDescription('resource_codes', {
  filters: ['appointment_id'],
})
