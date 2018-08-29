import createResourceDescription from './util/createResourceDescription'
import { HTTP_VERB_POST } from '../constants'

export const insights = createResourceDescription(
  'insights',
  {},
  {
    auth: createResourceDescription('auth', {
      allowed_methods: [HTTP_VERB_POST],
    }),
  }
)
