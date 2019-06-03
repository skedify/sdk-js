import createResourceDescription from './util/createResourceDescription'

export const modules = createResourceDescription(
  'modules',
  {
    enable_pagination: false,
  },
  {
    translations: createResourceDescription('translations', {
      enable_pagination: false,
    }),
    languages: createResourceDescription(
      'languages',
      { enable_pagination: false },
      {
        translations: createResourceDescription('translations', {
          enable_pagination: false,
        }),
      }
    ),
  }
)
