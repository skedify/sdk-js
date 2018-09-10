import createResourceDescription from './util/createResourceDescription'

export const offices = createResourceDescription(
  'offices',
  {
    includes: [
      'subject_settings',
      'contacts',
      'contacts.employee',
      'contacts.subjects',
      'contacts.user',
    ],
    filters: [
      'external_id',
      'schedulable_for_subject',
      'schedulable_with_contact',
      'schedulable',
      'nearest_to_geo',
      'limit',
    ],
  },
  {
    contacts: createResourceDescription('contacts', {
      includes: ['user'],
    }),
    officeManagers: createResourceDescription('office_managers', {
      includes: ['user'],
    }),
    subjectSettings: createResourceDescription('subject_settings', {
      filters: ['subject_id'],
    }),
    availabilityHoursExceptions: createResourceDescription(
      'availability_hours_exceptions'
    ),
  }
)
