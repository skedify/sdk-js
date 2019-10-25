import createResourceDescription from './util/createResourceDescription'

export const leadSegmentSubjects = createResourceDescription(
  'lead_segment_subjects',
  {
    includes: ['lead_segment', 'subject'],
  }
)
