declare module "skedify-sdk" {
  export interface User {
    id: string;
    created_at: string;
    email: string;
    external_id: string | null;
    first_name: string | null;
    gender: string | null;
    last_name: string | null;
    language: string | null;
    phone_number: string | null;
    profile_picture: string | null;
    state: State;
    timezone: string;
    updated_at: string;
  }

  interface BaseRole {
    id: string;
    created_at: string;
    updated_at: string;
  }

  interface ContactRole extends BaseRole {
    uuid: string;
    default_week_template: string | null;
    function: string | null;
    introduction: string | null;
    is_active: boolean;
    video_url?: string | null;
    timezone: null | string;
  }

  interface AdminRole extends BaseRole {
    is_owner: boolean;
  }

  interface CentralPlannerRole extends BaseRole {}
  interface OfficeManagerRole extends BaseRole {}

  /**
   * No support for enum in d.ts
   * Use StateEnum for mapped enum value
   * corresponds with:
   * - PENDING = 0,
   * - SUSPENDED = 4,
   * - ACTIVE = 8,
   */
  export type State = 0 | 4 | 8;

  export type RoleIdentifier = "central_planner" | "contact" | "admin" | "office_manager";

  export interface ContactInfo extends BaseFields {
    email: string;
    phone_number: string | null;
    profile_picture: string | null;
    state: State;
    updated_at: string;
    user_id: string;
  }

  export interface WithEmployeeUser {
    user: User | null;
  }

  export interface WithEmployeeRoles {
    roles: {
      central_planner?: CentralPlannerRole;
      contact?: ContactRole;
      admin?: AdminRole;
      office_manager?: OfficeManagerRole;
    };
  }

  export interface Employee extends ContactInfo {}

  export interface WithContactEmployee {
    roles: {
      contact: ContactRole;
    };
  }

  export interface WithOfficeManagerEmployee {
    roles: {
      office_manager: OfficeManagerRole;
    };
  }

  export interface Admin extends ContactInfo {
    roles: {
      admin?: AdminRole;
    };
  }

  export interface CentralPlanner extends ContactInfo {
    roles: {
      admin?: CentralPlannerRole;
    };
  }

  export interface OfficeManager extends ContactInfo {
    roles: {
      office_manager?: OfficeManagerRole;
    };
  }

  export interface Contact extends ContactInfo {
    roles: {
      contact?: ContactRole;
    };
  }
}
