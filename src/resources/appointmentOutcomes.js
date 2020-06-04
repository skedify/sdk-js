import createResourceDescription from './util/createResourceDescription'

export const appointmentOutcomes = createResourceDescription(
  'appointment_outcomes',
  {
    includes: ['appointment', 'outcome'],
    filters: ['appointment_id', 'outcome_id'],
  }
)
