declare module "skedify-sdk" {
  /**
   * No support for enum in d.ts files
   * Use OutcomeTypeEnum for mapped enum value
   */
  export type OutcomeType = "cancellation" | "completion";

  export interface Outcome {
    archived_at: string;
    created_at: string;
    description: string | null;
    external_id: string | null;
    id: string;
    name: string;
    type: OutcomeType;
    updated_at: string;
  }

  export interface OutcomeList {
    created_at: string;
    id: string;
    name: string;
    type: OutcomeType;
    updated_at: string;
  }

  export type WithOutcomeOutcomeList = {
    outcome_outcome_lists: OutcomeOutcomeList[];
  };

  export interface OutcomeOutcomeList {
    id: string;
    outcome_id: string;
    outcome_list_id: string;
  }
}
