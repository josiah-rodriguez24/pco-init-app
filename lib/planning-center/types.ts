// ---------------------------------------------------------------------------
// JSON:API transport types for Planning Center responses.
// These mirror the wire format — internal app models are separate.
//
// Field names verified against: API Documentation/services_2018-11-01.json
// (Planning Center Services OpenAPI spec, version 2018-11-01)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Generic JSON:API envelope types
// ---------------------------------------------------------------------------

export interface JsonApiResourceIdentifier {
  id: string;
  type: string;
}

export interface JsonApiResource<TAttributes = Record<string, unknown>> {
  id: string;
  type: string;
  attributes: TAttributes;
  relationships?: Record<
    string,
    {
      data?:
        | JsonApiResourceIdentifier
        | JsonApiResourceIdentifier[]
        | null;
      links?: Record<string, string>;
    }
  >;
  links?: Record<string, string>;
}

export interface JsonApiCollectionResponse<
  TAttributes = Record<string, unknown>,
> {
  data: JsonApiResource<TAttributes>[];
  included?: JsonApiResource[];
  links?: {
    self?: string;
    next?: string;
    prev?: string;
  };
  meta?: {
    total_count?: number;
    count?: number;
    parent?: JsonApiResourceIdentifier;
    [key: string]: unknown;
  };
}

export interface JsonApiSingleResponse<
  TAttributes = Record<string, unknown>,
> {
  data: JsonApiResource<TAttributes>;
  included?: JsonApiResource[];
}

// ---------------------------------------------------------------------------
// ServiceType attributes (schema: servicetype_attributes)
// ---------------------------------------------------------------------------
export interface PcoServiceTypeAttributes {
  name?: string;
  frequency?: string | null;
  sequence?: number | null;
  last_plan_from?: string | null;
  permissions?: string | null;
  archived_at?: string | null;
  created_at?: string;
  updated_at?: string;
  // TODO [field]: attachment_types_enabled, background_check_permissions,
  // comment_permissions, custom_item_types, deleted_at, scheduled_publish,
  // standard_item_types — available but not mapped in v1.
}

// ---------------------------------------------------------------------------
// Plan attributes (schema: plan_attributes)
// ---------------------------------------------------------------------------
export interface PcoPlanAttributes {
  title?: string | null;
  dates?: string | null;
  short_dates?: string | null;
  sort_date?: string | null;
  series_title?: string | null;
  total_length?: number | null;
  items_count?: number | null;
  plan_people_count?: number | null;
  needed_positions_count?: number | null;
  public?: boolean;
  multi_day?: boolean;
  planning_center_url?: string | null;
  created_at?: string;
  updated_at?: string;
  // TODO [field]: can_view_order, files_expire_at, last_time_at,
  // other_time_count, permissions, plan_notes_count,
  // prefers_order_view, rehearsable, rehearsal_time_count,
  // reminders_disabled, service_time_count — available but not mapped in v1.
}

// ---------------------------------------------------------------------------
// Team attributes (schema: team_attributes)
// ---------------------------------------------------------------------------
export interface PcoTeamAttributes {
  name?: string;
  sequence?: number | null;
  schedule_to?: string | null;
  default_status?: string | null;
  archived_at?: string | null;
  assigned_directly?: boolean;
  rehearsal_team?: boolean;
  secure_team?: boolean;
  stage_color?: string | null;
  stage_variant?: string | null;
  viewers_see?: string | null;
  created_at?: string;
  updated_at?: string;
  // TODO [field]: default_prepare_notifications, deleted_at,
  // last_plan_from — available but not mapped in v1.
}

// ---------------------------------------------------------------------------
// PlanPerson attributes (schema: planperson_attributes)
// Used in GET /service_types/{id}/plans/{id}/team_members
// The resource type in JSON:API responses is "PlanPerson".
// ---------------------------------------------------------------------------
export interface PcoPlanPersonAttributes {
  name?: string;
  status?: string | null;
  team_position_name?: string | null;
  photo_thumbnail?: string | null;
  decline_reason?: string | null;
  notes?: string | null;
  notification_sent_at?: string | null;
  scheduled_by_name?: string | null;
  status_updated_at?: string | null;
  can_accept_partial?: boolean;
  created_at?: string;
  updated_at?: string;
  // TODO [field]: notification_changed_at, notification_changed_by_name,
  // notification_prepared_at, notification_read_at,
  // notification_sender_name, prepare_notification,
  // scheduled_by_is_eligible_for_responds_to — available but not mapped in v1.
}

// ---------------------------------------------------------------------------
// Item attributes (schema: item_attributes)
// ---------------------------------------------------------------------------
export interface PcoItemAttributes {
  title?: string;
  description?: string | null;
  item_type?: string | null;
  sequence?: number | null;
  length?: number | null;
  service_position?: string | null;
  key_name?: string | null;
  html_details?: string | null;
  created_at?: string;
  updated_at?: string;
  // TODO [field]: assigned_leader_ids, assigned_unfilled_position_ids,
  // custom_arrangement_sequence, custom_arrangement_sequence_full,
  // custom_arrangement_sequence_short — available but not mapped in v1.
}

// ---------------------------------------------------------------------------
// Song attributes (schema: song_attributes)
// ---------------------------------------------------------------------------
export interface PcoSongAttributes {
  title?: string;
  author?: string | null;
  ccli_number?: string | null;
  copyright?: string | null;
  themes?: string | null;
  admin?: boolean;
  hidden?: boolean;
  last_scheduled_at?: string | null;
  last_scheduled_short_dates?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

// ---------------------------------------------------------------------------
// Person attributes (schema: person_attributes)
// From GET /people — Services-scoped person profiles
// ---------------------------------------------------------------------------
export interface PcoPersonAttributes {
  first_name?: string;
  last_name?: string;
  full_name?: string;
  photo_thumbnail_url?: string | null;
  photo_url?: string | null;
  status?: string | null;
  archived?: boolean;
  archived_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

// ---------------------------------------------------------------------------
// Email attributes — from GET /people/{id}/emails
// ---------------------------------------------------------------------------
export interface PcoEmailAttributes {
  address?: string;
  primary?: boolean;
  location?: string | null;
  created_at?: string;
  updated_at?: string;
}

// ---------------------------------------------------------------------------
// Blockout attributes (schema: blockout_attributes)
// From GET /people/{id}/blockouts
// ---------------------------------------------------------------------------
export interface PcoBlockoutAttributes {
  description?: string | null;
  reason?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  repeat_frequency?: string | null;
  repeat_period?: string | null;
  repeat_interval?: string | null;
  repeat_until?: string | null;
  time_zone?: string | null;
  share?: boolean;
  created_at?: string;
  updated_at?: string;
}

// ---------------------------------------------------------------------------
// TeamPosition attributes (schema: teamposition_attributes)
// From GET /service_types/{id}/team_positions
// ---------------------------------------------------------------------------
export interface PcoTeamPositionAttributes {
  name?: string;
  sequence?: number | null;
  tags?: Record<string, unknown>[];
  tag_groups?: Record<string, unknown>[];
  negative_tag_groups?: Record<string, unknown>[];
}

// ---------------------------------------------------------------------------
// PersonTeamPositionAssignment attributes
// From GET /service_types/{id}/team_positions/{id}/person_team_position_assignments
// ---------------------------------------------------------------------------
export interface PcoPersonTeamPositionAssignmentAttributes {
  schedule_preference?: string | null;
  preferred_weeks?: string[];
  created_at?: string;
  updated_at?: string;
}

// ---------------------------------------------------------------------------
// NeededPosition attributes (schema: neededposition_attributes)
// From GET /service_types/{id}/plans/{id}/needed_positions
// ---------------------------------------------------------------------------
export interface PcoNeededPositionAttributes {
  quantity?: number | null;
  scheduled_to?: string | null;
  team_position_name?: string | null;
}

// ---------------------------------------------------------------------------
// PlanTime attributes (schema: plantime_attributes)
// From GET /service_types/{id}/plans/{id}/plan_times
// ---------------------------------------------------------------------------
export interface PcoPlanTimeAttributes {
  name?: string | null;
  time_type?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  live_starts_at?: string | null;
  live_ends_at?: string | null;
  recorded?: boolean;
  created_at?: string;
  updated_at?: string;
}
