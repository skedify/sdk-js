declare module "skedify-sdk" {
  export interface SyncAccount {
    id: string;
    user_id: string;
    account_email: string;
    account_id: string;
    provider: string;
    profile_picture: string;
    profile_url: any;
    access_token_expire: string;
    locale: any;
    created_at: string;
    updated_at: string;
  }

  export interface WithCalendars {
    calendars: SyncAccountCalendar[];
  }

  export interface SyncAccountCalendar {
    id: string;
    provider: string;
    sync_account_id: string;
    syncing: boolean;
    exporting: boolean;
    sync_availability: boolean;
    uid: string;
    name: string;
    description: any;
    url: any;
    owner: any;
    min_access_role: string;
    originally_created: any;
    last_modified: any;
    timezone: string;
    created_at: string;
    updated_at: string;
  }
}
