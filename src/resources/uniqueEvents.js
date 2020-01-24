import createResourceDescription from './util/createResourceDescription'
import { HTTP_VERB_POST } from '../constants'

export const uniqueEvents = createResourceDescription('unique_events', {
  allowed_methods: [HTTP_VERB_POST],
  requires_domain_map: true,
  enable_pagination: false,
})
