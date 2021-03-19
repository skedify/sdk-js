import createResourceDescription from './util/createResourceDescription'

export const modules = createResourceDescription(
  'modules',
  {
    enable_pagination: false,
    enable_id_filter: false,
  },
  {
    translations: createResourceDescription('translations', {
      enable_pagination: false,
      enable_id_filter: false,
    }),
    languages: createResourceDescription(
      'languages',
      { enable_pagination: false, enable_id_filter: false },
      {
        translations: createResourceDescription('translations', {
          enable_pagination: false,
          enable_id_filter: false,
        }),
      }
    ),
  }
)
