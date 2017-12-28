import * as resources from '.'

describe('resources', () => {
  it('should define all the resources', () => {
    expect(resources).toMatchSnapshot()
  })
})
