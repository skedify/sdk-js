declare module "skedify-sdk" {
  export interface SchedulableListing extends Listing {
    contactIds?: number[] | null;
    meetingTypes?: MeetingTypeLabel[] | null;
    officeIds?: number[] | null;
    subjectIds: number[];
  }
}
