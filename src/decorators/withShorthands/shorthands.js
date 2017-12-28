import assert from './assert'

export const timetable = SDK => ({ subject, office, start, end } = {}) => {
  assert('timetable', { subject, office, start, end })

  return SDK.subjects(subject)
    .timetable()
    .filter(item =>
      item
        .office(office)
        .start(start)
        .end(end)
    )
}
