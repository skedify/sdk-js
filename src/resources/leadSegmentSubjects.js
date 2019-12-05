import createResourceDescription from './util/createResourceDescription'

export const leadSegmentSubjects = createResourceDescription(
  'lead_segment_subjects',
  {
    filters: ['lead_segment_id', 'subject_id'],
    includes: ['lead_segment', 'subject'],
  }
)
