declare module "skedify-sdk" {
  export interface LeadSegment {
    id: string;
    code: string;
    description: string;
    earliest_callback_hours?: number | null;
    latest_callback_hours?: number | null;
    is_callback_allowed: boolean;
    created_at: string;
    updated_at: string;
  }

  export interface LeadSegmentSubject {
    id: string;
    lead_segment_id: string;
    subject_id: string;
    meeting_type: MeetingType;
    is_preferred: boolean;
    created_at: string;
    updated_at: string;
  }

  export interface WithLeadSegmentSubjects {
    lead_segment_subjects: LeadSegmentSubject[];
  }
}
