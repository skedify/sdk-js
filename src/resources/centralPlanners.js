import createResourceDescription from './util/createResourceDescription'

export const centralPlanners = createResourceDescription('central_planners', {
  includes: ['user'],
  filters: ['id'],
})
