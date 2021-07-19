declare module "skedify-sdk" {
  export interface SubjectCategory extends BaseFields {
    color: string;
    image: string | null;
    name: string;
    order: number;
  }

  export interface SubjectCategoryLanguage {
    enterprise_id: number;
    created_at: string;
    updated_at: string;
    locale: Locale;
    translations?: {
      id: string;
      created_at: string;
      updated_at: string;
      subject_category_id: string;
      name: string;
    } | null;
  }

  export interface WithSubjectCategoryLanguageTranslations {
    languages: { [locale: string]: SubjectCategoryLanguage };
  }

  export interface Subject extends BaseFields {
    completion_outcome_list_id: string | null;
    customer_cancellation_outcome_list_id: string | null;
    contact_cancellation_outcome_list_id: string | null;
    category_id: string;
    description: string;
    instructions: string;
    is_active: boolean;
    is_default: boolean;
    is_shortlist: boolean;
    order: number;
    timezone: string | null;
    title: string;
  }

  /**
   * @deprecated
   * Use the following composable interfaces:
   * - WithCategory
   */
  export interface SubjectWithCategory extends Subject {
    subject_category: SubjectCategory | null;
  }

  export interface WithCategory {
    subject_category: SubjectCategory | null;
  }

  /**
   * No support for enum in d.ts files
   * Use MeetingTypeEnum for mapped enum value
   */
  export type MeetingType = "office" | "on_location" | "phone" | "video";
  export type ReceiverType = "customer" | "contact";

  export interface SubjectAvailabilitySettings {
    auto_accept?: boolean | null;
    created_at?: string;
    estimated_duration?: number | null;
    id?: string;
    is_meeting_type_allowed?: boolean | null;
    max_concurrent_appointments?: number | null;
    meeting_type: MeetingType;
    time_slot_earliest_possible?: number | null;
    time_slot_granularity?: number | null;
    time_slot_latest_possible?: number | null;
    trailing_buffer_time?: number | null;
    updated_at?: string;
  }

  export interface OfficeSubjectAvailabilitySettings extends SubjectAvailabilitySettings {
    subject_id: string;
    office_id: string
  }

  export interface SubjectTranslation {
    id: string;
    subject_id: string;
    title: string;
    description: string | null;
    instructions: string | null;
    created_at: string;
    updated_at: string;
  }

  export interface SubjectLanguages {
    [locale: string]: {
      enterprise_id: string;
      created_at: string;
      updated_at: string;
      translations?: SubjectTranslation | null;
    };
  }

  export interface WithSubjectQuestionLanguages {
    languages: {
      [locale: string]: {
        enterprise_id: string;
        created_at: string;
        updated_at: string;
        translations: { label?: string; help_text?: string; placeholder?: string } | null;
      };
    };
  }

  export interface WithSubjectOptionLanguages {
    languages: {
      [locale: string]: {
        enterprise_id: string;
        created_at: string;
        updated_at: string;
        translations: { label?: string } | null;
      };
    };
  }

  export interface WithAvailabilitySettings {
    availability_settings: SubjectAvailabilitySettings[];
  }

  export interface WithLanguages {
    languages: SubjectLanguages;
  }

  export interface WithSubjectQuestions<T = unknown> {
    questions: (SubjectQuestion & T)[];
  }

  /**
   * No support for enum in d.ts files
   * Use QuestionDataTypeEnum for mapped enum value
   */
  export type SubjectQuestionDataType = "final_remarks" | "text" | "number" | "website";

  /**
   * No support for enum in d.ts files
   * Use QuestionInputTypeEnum for mapped enum value
   */
  export type SubjectQuestionInputType =
    | "text_area"
    | "text_field"
    | "check_boxes"
    | "radio_buttons";

  /**
   * No support for enum in d.ts files
   * Use QuestionTypeEnum for mapped enum value
   */
  export type SubjectQuestionType = "long_text" | "short_text" | "select" | "number";

  interface SubjectSettings {
    label_visible: boolean;
    help_text_visible: boolean;
    required: boolean;
  }

  export interface SubjectOption extends Omit<BaseFields, "enterprise_id"> {
    question_id: string;
    label: string;
    value: string;
    is_open?: number;
    updated_at: string;
  }

  export interface SubjectQuestion extends Omit<BaseFields, "enterprise_id"> {
    subject_id: string;
    label: string;
    data_type: SubjectQuestionDataType;
    input_type: SubjectQuestionInputType;
    category: string;
    order: number;
    settings?: SubjectSettings | null;
    visible: boolean;
    help_text: string | null;
    placeholder?: string | null;
    merge_tag: string;
    is_conditional: boolean;
    updated_at: string;
    languages?: unknown;
    options: SubjectOption[];
  }
}
