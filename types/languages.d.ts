declare module "skedify-sdk" {
  export type Locale = "en" | "nl" | "fr" | "de" | "da" | "nb";

  export interface Language extends Omit<BaseFields, "id" | "external_id"> {
    locale: Locale;
  }
}
