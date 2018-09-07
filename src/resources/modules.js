import createResourceDescription from './util/createResourceDescription'

export const modules = createResourceDescription(
  'modules',
  {},
  {
    translations: createResourceDescription('translations'),
    languages: createResourceDescription(
      'languages',
      {},
      {
        translations: createResourceDescription('translations'),
      }
    ),
  }
)
