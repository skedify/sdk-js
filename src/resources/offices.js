import createResourceDescription from './util/createResourceDescription'

export const offices = createResourceDescription(
  'offices',
  {
    includes: [
      'subject_settings',
      'contact_offices',
      'contact_offices.contact',
      'contact_offices.contact.employee',
      'contact_offices.contact.contact_office_subjects',
      'contact_offices.contact.contact_office_subjects.subject',
      'contact_offices.contact.user',
      'contacts',
      'contacts.employee',
      'contacts.user',
      'office_manager_offices',
      'office_manager_offices.office_manager',
      'office_manager_offices.office_manager.user',
      'office_manager_offices.office_manager.employee',
      'office_managers',
      'office_managers.user',
      'office_managers.employee',
      'office_subject_availability_settings',
    ],
    filters: [
      'external_id',
      'schedulable_for_subject',
      'schedulable_with_contact',
      'schedulable_for_meeting_type',
      'schedulable',
      'nearest_to_geo',
      { name: 'geolocation', key: 'location[geolocation]' },
      'limit',
    ],
  },
  {
    contacts: createResourceDescription('contacts', {
      includes: ['user'],
      deprecated: true,
    }),
    officeManagers: createResourceDescription('office_managers', {
      includes: ['user'],
      deprecated: true,
    }),
    subjectSettings: createResourceDescription('subject_settings', {
      filters: ['subject_id'],
      deprecated: true,
    }),
    availabilityHoursExceptions: createResourceDescription(
      'availability_hours_exceptions',
      { deprecated: true }
    ),
    subjectAvailabilitySettings: createResourceDescription(
      'subject_availability_settings'
    ),
    officeSubjectAvailabilitySettings: createResourceDescription(
      'office_subject_availability_settings'
    ),
  }
)
