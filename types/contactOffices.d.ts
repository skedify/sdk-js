declare module "skedify-sdk" {
  export interface ContactOffice {
    id: string;
    contact_id: string;
    office_id: string;
    created_at: string | null;
    updated_at: string | null;
  }

  export interface WithOffice {
    office: Office;
  }
}
