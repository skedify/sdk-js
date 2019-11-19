import createResourceDescription from './util/createResourceDescription'

export const coverageRegions = createResourceDescription('coverage_regions', {
  includes: ['contact_office', 'postal_code'],
  filters: ['contact_office_id', 'postal_code_id', 'meeting_types'],
})
