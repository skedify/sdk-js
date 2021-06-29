declare module "skedify-sdk" {
  export interface Enterprise {
    id: string;
    country: string;
    default_timezone: string;
    name: string;
    logo: string;
    picture_id: string | number;
    created_at: string;
    updated_at: string;
  }
}
