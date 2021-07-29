declare module 'skedify-sdk' {
  export interface Customer extends BaseFields {
    uuid: string;
    user_id?: string;
    preferred_office_id?: string;
    preferred_contact_id?: string;
    external_id?: string;
    email: string;
    first_name: string;
    last_name: string;
    gender?: string;
    date_of_birth?: string;
    language: string;
    phone_number?: string;
    profile_picture?: string;
    timezone: string;
    customer_number?: string;
    company?: string;
    notes?: string;
    is_existing: boolean;
    updated_at: string;
    location?: string;
  }
}
