import createResourceDescription from './util/createResourceDescription'
import { HTTP_VERB_GET } from '../constants'

export const timezones = createResourceDescription('timezones', {
  allowed_methods: [HTTP_VERB_GET],
})
