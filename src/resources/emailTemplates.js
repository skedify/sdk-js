import createResourceDescription from './util/createResourceDescription'

export const emailTemplates = createResourceDescription('email_templates', {
  enable_pagination: false,
  enable_id_filter: false,
})
