import createResourceDescription from './util/createResourceDescription'
import { HTTP_VERB_GET } from '../constants'

export const identity = createResourceDescription('identity', {
  allowed_methods: [HTTP_VERB_GET],
  enable_pagination: false,
})
