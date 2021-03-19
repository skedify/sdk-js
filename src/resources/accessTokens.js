import createResourceDescription from './util/createResourceDescription'

export const accessTokens = createResourceDescription('access_tokens', {
  enable_pagination: false,
  enable_id_filter: false,
})
