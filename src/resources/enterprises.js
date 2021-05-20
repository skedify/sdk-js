import createResourceDescription from './util/createResourceDescription'

export const enterprises = createResourceDescription('enterprises', {
  includes: ['enterprise_settings'],
})
