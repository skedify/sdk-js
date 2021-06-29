declare module "skedify-sdk" {
  export interface Location {
    city: string;
    country: string;
    full_address?: string;
    geolocation: string;
    postal_code: string;
    state: string | null;
    street_1: string;
    street_2: string | null;
  }

  export interface Office extends BaseFields {
    description: string | null;
    directions: string | null;
    email: string | null;
    is_active: boolean;
    is_virtual: boolean;
    location?: Location;
    parking_info: string | null;
    phone_number: string | null;
    timezone: string;
    title: string;
    updated_at: string;
  }

  /**
   * @deprecated
   * Use composable utility interfaces:
   * - WithOfficeManagers
   */
  export interface OfficeWithOfficeManagers extends Office {
    office_managers: (OfficeManager & WithEmployeeUser)[];
  }

  export interface WithOfficeManagers {
    office_managers: (OfficeManager & WithEmployeeUser)[];
  }
}
