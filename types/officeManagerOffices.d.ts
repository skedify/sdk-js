declare module "skedify-sdk" {
  export interface OfficeManagerOffice {
    id: string;
    office_id: string;
    office_manager_id: string;
    created_at: string;
    updated_at: string;
  }

  export interface WithOfficeManager<T> {
    office_manager: OfficeManager & T;
  }
}
