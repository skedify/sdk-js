import createResourceDescription from './util/createResourceDescription'

export const coverageRegions = createResourceDescription('coverage_regions', {
  includes: ['contact_office', 'postal_code'],
})
