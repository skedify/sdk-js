declare module "skedify-sdk" {
  export interface FeatureFlag extends Omit<BaseFields, "enterprise_id"> {
    is_enabled: boolean;
  }
}
