import createResourceDescription from './util/createResourceDescription'

export const featureFlags = createResourceDescription('feature_flags', {
  enable_pagination: false,
})
