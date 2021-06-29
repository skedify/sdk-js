declare module "skedify-sdk" {
  export type ReminderTypes = "textMessage" | "email";

  export type NotificationSettings = Record<ReminderTypes, boolean>;

  /**
   * No enum support in d.ts files,
   * Use NotificationKeysEnum for mapped enum value
   * corresponds with:
   * - acceptedByContact = 0,
   * - assignedByContact= 1,
   * - completedByContact = 2,
   * - invitedByContact = 3,
   * - cancelledByContact = 4,
   * - cancelledByCustomer = 5,
   * - dateCreatedByContact = 6,
   * - dateCreatedByCustomer =7,
   * - dateChangedByContact = 8,
   * - dateChangedByCustomer = 9,
   * - possibilitiesCreatedByCustomer = 10,
   * - possibilitiesChangedByCustomer = 11,
   * - possibilitiesRequestedByContact = 12,
   */
  export type NotificationKeys = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

  export type Notifications = {
    [k in NotificationKeys]: NotificationSettings;
  };

  interface ReminderInterval {
    time: number;
  }

  export type ReminderSettings = Record<ReminderTypes, ReminderInterval[]>;

  interface DefaultEnterpriseSettings {
    allow_office_365_login: boolean;
    allowed_sync_providers: string[];
    appointment_block_suggestions: string;
    appointment_completion_max_future_days: number;
    appointment_contact_select: string;
    appointment_max_suggestions: number;
    appointment_min_preparation_time: number;
    appointment_min_suggestions: number;
    availability_max_future_days_to_sync: number;
    contact_notifications: Notifications;
    default_language: Locale;
    enterprise_id: number;
    first_time_customer_fields: FirstTimeCustomerFields;
    id: string;
    internal_customer_fields: unknown;
    notifications_window?: unknown;
    notifications: Notifications;
    reminders: ReminderSettings;
    returning_customer_fields: ReturningCustomerFields;
    sender_email_addresses?: null | {
      [locale: string]: string | undefined | null;
    };
    show_qr_code_in_customer_email: boolean;
    video_provider_test_url: string;
    web_app_is_reassign_search_enabled: boolean;
  }

  export interface EnterpriseCustomerSettings {
    appointment_create_allow_change_customer: boolean;
    appointment_create_allow_create_customer: boolean;
    appointment_create_allow_customer_instigator: boolean;
    appointment_create_allow_invite_customer: boolean;
    web_app_customers_behaviour: "enabled" | "disabled";
  }

  export interface EnterpriseSubjectSettings {
    appointment_create_allow_set_subject: boolean;
    default_subject_id?: string | null;
  }

  export interface EnterpriseAvailabilitySettings {
    appointment_default_duration: number;
    appointment_earliest_possible: number;
    appointment_latest_possible: number;
    time_slot_granularity: number;
  }

  export interface EnterprisePluginSettings {
    redirect_url: string;
    localized_redirect_urls: [] | { [lang: string]: string };
    terms_conditions_url: string;
  }

  export type EnterpriseSettings = DefaultEnterpriseSettings &
    EnterpriseCustomerSettings &
    EnterpriseSubjectSettings &
    EnterpriseAvailabilitySettings &
    EnterprisePluginSettings;

  export interface CustomerFieldSetting {
    ask: boolean;
    required: boolean;
    order: number;
  }

  export interface FirstTimeCustomerFields {
    address: CustomerFieldSetting;
    cell_phone_number: CustomerFieldSetting;
    company: CustomerFieldSetting;
    credit_card_number: CustomerFieldSetting;
    customer_number: CustomerFieldSetting;
    debit_card_number: CustomerFieldSetting;
    dob: CustomerFieldSetting;
    /**
     * Mandatory
     */
    email: CustomerFieldSetting;
    home_phone_number: CustomerFieldSetting;
    is_existing: CustomerFieldSetting;
    /**
     * Mandatory
     */
    name: CustomerFieldSetting;
    title: CustomerFieldSetting;
  }

  export interface ReturningCustomerFields extends FirstTimeCustomerFields {
    /**
     * Mandatory
     */
    external_customer_id: CustomerFieldSetting;
  }
}
