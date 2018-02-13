import assert from './assert'

export const timetable = SDK => ({
  subject,
  office,
  start,
  end,
  contacts,
} = {}) => {
  assert('timetable', { subject, office, start, end })

  return SDK.subjects(subject)
    .timetable()
    .filter(item => {
      if (contacts) {
        item.contacts(contacts)
      }

      return item
        .office(office)
        .start(start)
        .end(end)
    })
}
