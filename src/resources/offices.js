import createResourceDescription from './util/createResourceDescription'

export const offices = createResourceDescription(
  'offices',
  {
    includes: [
      'contact_office_subjects.contact_office',
      'contact_office_subjects.contact_office.contact.user',
      'contact_office_subjects.contact_office.contact',
      'contact_office_subjects.subject',
      'contact_offices.contact',
      'contact_offices.contact.user',
      'contact_offices.contact.subjects',
      'contact_offices',
      'contacts',
      'contacts.subjects',
      'contacts.user',
      'subject_settings',
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
