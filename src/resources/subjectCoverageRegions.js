import createResourceDescription from './util/createResourceDescription'

export const subjectCoverageRegions = createResourceDescription(
  'subject_coverage_regions',
  {
    filters: ['postal_code_id', 'contact_office_subject_id', 'meeting_types'],
    includes: ['postal_code', 'contact_office_subject'],
  }
)
