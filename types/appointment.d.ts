declare module 'skedify-sdk' {
  export type AppointmentState =
    | 'incoming'
    | 'outgoing'
    | 'completed'
    | 'cancelled'
    | 'accepted'
    | 'occurred'

  export interface Appointment extends Omit<BaseFields, 'enterprise_id'> {
    uuid: string;
    listing_uuid: string;
    contact_id: string;
    customer_id: string;
    subject_id: string;
    office_id: string;
    state: AppointmentState;
    meeting_type: string;
    first_possibility_id: string;
    notes?: string;
    outcome_remark?: string;
    trailing_buffer_time: number;
    metadata: any[];
    customer_showed: boolean;
    is_success: boolean;
    video_url_for_contact: string;
    video_url_for_customer: string;
    video_test_url_for_contact: string;
    video_test_url_for_customer: string;
    cancellation_reason_id?: string;
    cancelled_by_id?: string;
    cancelled_by_type?: string;
    initiated_from: string;
    initiated_by_id: string;
    initiated_by_type: string;
    updated_at: string;
    updated_by_id: string;
    updated_by_type: string;
  }

  export interface Possibility
    extends Omit<BaseFields, 'enterprise_id' | 'external_id'> {
    appointment_id: number;
    start: string;
    end: string;
    timezone: string;
    duration: number;
    is_accepted: boolean;
    next_possibility_id: string | null;
    created_by_id: number;
    created_by_type: string;
    updated_by_id: number;
    updated_by_type: string;
    updated_at: string;
  }

  export interface WithSubject {
    subject: Subject;
  }

  export interface WithCustomer {
    customer: Customer;
  }

  export interface WithContact {
    contact: Employee & WithEmployeeUser;
  }

  export interface WithAcceptedPossibility {
    accepted_possibility: Possibility;
  }

  export interface WithPossibilities {
    possibilities: Possibility[];
  }
}
