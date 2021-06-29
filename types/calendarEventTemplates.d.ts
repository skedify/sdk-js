declare module "skedify-sdk" {
  export interface CalendarEventTemplate extends Omit<BaseFields, "external_id"> {
    locale: Locale;
    meeting_type: string;
    receiver_type: string;
    title: string;
    description: string;
    updated_at: string;
    deleted_at: string;
  }
}
