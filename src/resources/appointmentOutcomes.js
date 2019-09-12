import createResourceDescription from './util/createResourceDescription'

export const appointmentOutcomes = createResourceDescription(
  'appointment_outcomes',
  {
    includes: ['appointment', 'outcome'],
  }
)
