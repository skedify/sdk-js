/// <reference path="calendarEventTemplates.d.ts" />
/// <reference path="contactOfficeSubjects.d.ts" />
/// <reference path="contactOffices.d.ts" />
/// <reference path="employees.d.ts" />
/// <reference path="enterprise.d.ts" />
/// <reference path="enterpriseSettings.d.ts" />
/// <reference path="featureFlag.d.ts" />
/// <reference path="languages.d.ts" />
/// <reference path="leadSegments.d.ts" />
/// <reference path="listings.d.ts" />
/// <reference path="officeManagerOffices.d.ts" />
/// <reference path="officeManagers.d.ts" />
/// <reference path="offices.d.ts" />
/// <reference path="outcomes.d.ts" />
/// <reference path="recaptchaDomain.d.ts" />
/// <reference path="schedulableListing.d.ts" />
/// <reference path="shared.d.ts" />
/// <reference path="subject.d.ts" />
/// <reference path="subjectCategories.d.ts" />
/// <reference path="users.d.ts" />

declare module "skedify-sdk" {
  type WithSave<T, Response> = T & { save: () => Response };
  type WithCreate<T, Response> = T & { create: () => Response };
  type WithDelete<T, Response> = T & { delete: () => Response };

  type WithFilter<T, AdditionalFilters> = {
    [key in keyof T | AdditionalFilters]: (param: T[key]) => void;
  };

  type GenericAPI<Entity, Response = APIResponse<Entity>> = {
    // TODO fix with actuals, probably need to enhance Response based on include params
    include<T>(
      ...includes: Include[]
    ): Entity extends Array<infer Item> ? GenericAPI<(Item & T)[]> : GenericAPI<Entity & T>;

    filter: Entity extends Array<infer Item>
      ? <AdditionalFilters = "">(
          cb: (filterItem: WithFilter<Item, AdditionalFilters>) => unknown
        ) => GenericAPI<Entity>
      : <AdditionalFilters = "">(
          cb: (filterItem: WithFilter<Entity, AdditionalFilters>) => unknown
        ) => GenericAPI<Entity>;

    update: Entity extends Array<infer Item>
      ? (data: Partial<Item>) => GenericAPI<Item, WithSave<APIResponse<Item>, APIResponse<Item>>>
      : (data: Partial<Entity>) => GenericAPI<Entity, WithSave<APIResponse<Entity>, Response>>;

    replace: Entity extends Array<infer Item>
      ? (data: Partial<Item>) => GenericAPI<Item, WithSave<APIResponse<Item>, APIResponse<Item>>>
      : (data: Partial<Entity>) => GenericAPI<Entity, WithSave<APIResponse<Entity>, Response>>;

    new: Entity extends Array<infer Item>
      ? (data: Partial<Item>) => GenericAPI<Item, WithCreate<APIResponse<Item>, APIResponse<Item>>>
      : (data: Partial<Entity>) => GenericAPI<Entity, WithCreate<APIResponse<Entity>, Response>>;

    delete: () => GenericAPI<Entity, WithDelete<APIResponse<Entity>, Response>>;

    then<T>(cb: (response: Response) => T): Promise<T>;
  };

  type Include = { toString(): string; __secret__: boolean };

  interface APIConfiguration {
    auth_provider: string;
    locale?: string;
    onError?: (response: APIResponse<unknown>) => void;
    resource_domain_map?: { [key: string]: { url: string } };
  }

  export class API {
    static createAuthProviderString(
      kind: string,
      options: {
        realm?: string;
        token_type: string;
        access_token?: string;
      }
    ): string;

    constructor(params: APIConfiguration);

    configure(params: Partial<APIConfiguration>): void;

    include: {
      accepted_possibility: Include;
      answers: Include;
      appointment: Include;
      appointment_outcomes: Include;
      appointments: Include;
      availability_settings: Include;
      calendars: Include;
      completion_outcome_list: Include & { outcome_outcome_lists: Include; outcomes: Include };
      contact: Include & { employee: Include; user: Include };
      contact_cancellation_outcome_list: Include & {
        outcome_outcome_lists: Include;
        outcomes: Include;
      };
      contact_office: Include & { contact: Include; office: Include };
      contact_office_availability_settings: Include;
      contact_office_subject: Include & { office: Include; subject: Include };
      contact_office_subject_availability_settings: Include;
      contact_office_subjects: Include & { subject: Include & { subject_category: Include } };
      contact_offices: Include & {
        contact: Include & {
          contact_office_subjects: Include & { subject: Include };
          employee: Include;
          user: Include;
        };
        office: Include;
      };
      contacts: Include & { employee: Include; user: Include };
      customer: Include;
      customer_cancellation_outcome_list: Include & {
        outcome_outcome_lists: Include;
        outcomes: Include;
      };
      day_template: Include & { day_time_slots: Include };
      day_time_slots: Include & {
        availability_settings: Include;
        offices: Include;
        subjects: Include;
      };
      employee: Include & { enterprise: Include };
      employees: Include;
      enterprise: Include;
      initiated_by: Include;
      language: Include;
      languages: Include & { translations: Include };
      lead_segment: Include;
      lead_segment_subjects: Include;
      lead_segments: Include;
      office: Include;
      office_manager: Include & { user: Include };
      office_manager_offices: Include & {
        office_manager: Include & { employee: Include; user: Include };
      };
      office_managers: Include & { employee: Include; user: Include };
      office_subject_availability_settings: Include;
      offices: Include;
      options: Include;
      outcome: Include;
      outcome_list: Include;
      outcome_lists: Include;
      outcome_outcome_lists: Include;
      outcomes: Include;
      possibilities: Include;
      postal_code: Include;
      question: Include;
      questions: Include;
      roles: Include;
      subject: Include & { subject_category: Include };
      subject_category: Include;
      subject_settings: Include;
      subjects: Include & { subject_category: Include };
      sync_account: Include;
      sync_accounts: Include;
      user: Include;
      week_template: Include & { week_time_slots: Include };
      week_time_slots: Include & {
        availability_settings: Include;
        offices: Include;
        subjects: Include;
      };
    };

    admins(): GenericAPI<Admin[]>;
    admins(id: string): GenericAPI<Admin>;

    calendarEventTemplates(): GenericAPI<CalendarEventTemplate[]>;
    calendarEventTemplates(id: string): GenericAPI<CalendarEventTemplate>;

    centralPlanners(): GenericAPI<CentralPlanner[]>;
    centralPlanners(id: string): GenericAPI<CentralPlanner>;

    contacts(): GenericAPI<Contact[]>;
    contacts(id: string): GenericAPI<Contact>;

    featureFlags(): GenericAPI<FeatureFlag[]>;

    employees(): GenericAPI<Employee[]>;
    employees(id: string): GenericAPI<Employee>;

    offices(): GenericAPI<Office[]>;
    offices(id: string): GenericAPI<Office>;

    leadSegments(): GenericAPI<LeadSegment[]>;
    leadSegments(id: string): GenericAPI<LeadSegment>;

    leadSegmentSubjects(): GenericAPI<LeadSegmentSubject[]>;
    leadSegmentSubjects(id: string): GenericAPI<LeadSegmentSubject>;

    listings(): GenericAPI<Listing[]>;
    listings(id: string): GenericAPI<SchedulableListing>;

    officeManagers(): GenericAPI<OfficeManager[]>;
    officeManagers(id: string): GenericAPI<OfficeManager>;

    officeManagerOffices(): GenericAPI<OfficeManagerOffice[]>;
    officeManagerOffices(id: string): GenericAPI<OfficeManagerOffice>;

    contactOffices(): GenericAPI<ContactOffice[]>;
    contactOffices(id: string): GenericAPI<ContactOffice>;

    contactOfficeSubjects(): GenericAPI<ContactOfficeSubject[]>;
    contactOfficeSubjects(id: string): GenericAPI<ContactOfficeSubject>;

    outcomes(): GenericAPI<Outcome[]>;
    outcomes(id: string): GenericAPI<Outcome>;
    outcomeLists(): GenericAPI<OutcomeList[]>;
    outcomeLists(id: string): GenericAPI<OutcomeList>;
    outcomeOutcomeLists(): GenericAPI<OutcomeOutcomeList[]>;
    outcomeOutcomeLists(id: string): GenericAPI<OutcomeOutcomeList>;

    enterprises(): GenericAPI<Enterprise[]>;
    enterprises(id: string): GenericAPI<Enterprise>;

    enterpriseSettings(): GenericAPI<EnterpriseSettings[]>;
    enterpriseSettings(id: string): GenericAPI<EnterpriseSettings>;

    recaptchaDomains(): GenericAPI<RecaptchaDomain[]>;
    recaptchaDomains(id: string): GenericAPI<RecaptchaDomain>;

    subjects(): GenericAPI<Subject[]>;
    subjects(id: string): GenericAPI<Subject> & {
      questions(): GenericAPI<SubjectQuestion[]>;
      questions(id: string): GenericAPI<SubjectQuestion> & {
        options(): GenericAPI<SubjectOption[]>;
        options(id: string): GenericAPI<SubjectOption>;
      };

      availabilitySettings(): GenericAPI<SubjectAvailabilitySettings[]>;
      availabilitySettings(id?: string): GenericAPI<SubjectAvailabilitySettings>;
    };

    subjectCategories(): GenericAPI<SubjectCategory[]>;
    subjectCategories(id: string): GenericAPI<SubjectCategory> & {
      languages(): GenericAPI<SubjectCategoryLanguage[]>;
      languages(id?: string): GenericAPI<SubjectCategoryLanguage>;
    };

    languages(): GenericAPI<Language[]>;
    languages(locale: Locale): GenericAPI<Language>;

    users(id?: string): GenericAPI<User> & {
      syncAccounts(): GenericAPI<SyncAccount[]>;
    };

    identity(): Promise<APIResponse<{ id: string }>>;
  }
}