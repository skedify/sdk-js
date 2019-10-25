import createResourceDescription from './util/createResourceDescription'

export const leadSegments = createResourceDescription('lead_segments', {
  includes: ['lead_segment_subjects', 'subjects'],
})
