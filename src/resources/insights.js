import createResourceDescription from './util/createResourceDescription'
import { HTTP_VERB_POST } from '../constants'

export const insights = createResourceDescription(
  'insights',
  {},
  {
    auth: createResourceDescription('auth', {
      allowed_methods: [HTTP_VERB_POST],
      enable_pagination: false,
      enable_id_filter: false,
    }),
  }
)
