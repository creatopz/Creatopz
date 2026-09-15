// Hand-written to mirror supabase/schema.sql. If you change the schema,
// regenerate with the Supabase CLI instead:
//   supabase gen types typescript --project-id <ref> > src/types/database.ts
//
// Every table needs `Relationships: []` (even though we don't populate real
// relationship metadata) and the schema needs `Views`/`Functions`, or
// @supabase/postgrest-js's generic constraints silently collapse every
// Row/Insert/Update in this file down to `never`.

export type ReactionKind = "me_too" | "felt_that" | "ouch" | "hug";
export type ZoneTheme = "ink" | "red" | "blue" | "acid";
export type ProfileRole = "user" | "moderator" | "admin";
export type ProfileStatus = "active" | "warned" | "suspended" | "banned";
export type PostVisibility = "public" | "zone_only";
export type SubscriptionPlan = "monthly" | "yearly" | "lifetime";
export type SubscriptionStatus = "pending" | "active" | "expired" | "cancelled" | "failed";
export type ReportStatus = "open" | "reviewing" | "resolved" | "dismissed";

export interface AvatarConfig {
  skinTone: string;
  faceShape: string;
  hair: string;
  hairColor: string;
  eyes: string;
  eyebrows: string;
  clothing: string;
  clothingColor: string;
  accessory: string;
  detail: string;
  background: string;
}

type Table<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

// `type`, not `interface` — TS only grants object-type-literals the implicit
// string index signature that GenericSchema's `Record<string, GenericTable>`
// constraint needs; an `interface` here silently makes every table `never`.
export type Database = {
  public: {
    Tables: {
      profiles: Table<
        {
          id: string;
          anonymous_username: string;
          avatar_config: AvatarConfig;
          avatar_expression: string;
          bio: string | null;
          role: ProfileRole;
          status: ProfileStatus;
          match_tags: string[];
          created_at: string;
        },
        {
          id: string;
          anonymous_username: string;
          avatar_config?: AvatarConfig;
          avatar_expression?: string;
          bio?: string | null;
          match_tags?: string[];
        },
        Partial<{
          anonymous_username: string;
          avatar_config: AvatarConfig;
          avatar_expression: string;
          bio: string | null;
          match_tags: string[];
          role: ProfileRole;
          status: ProfileStatus;
        }>
      >;
      fault_zones: Table<
        {
          id: string;
          slug: string;
          name: string;
          description: string;
          theme: ZoneTheme;
          is_featured: boolean;
          is_archived: boolean;
          created_at: string;
        },
        Partial<{
          slug: string;
          name: string;
          description: string;
          theme: ZoneTheme;
          is_featured: boolean;
          is_archived: boolean;
        }>
      >;
      zone_members: Table<
        { zone_id: string; user_id: string; joined_at: string },
        { zone_id: string; user_id: string }
      >;
      posts: Table<
        {
          id: string;
          author_id: string;
          content: string;
          emotional_tags: string[];
          zone_id: string | null;
          visibility: PostVisibility;
          is_hidden: boolean;
          hidden_reason: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          author_id: string;
          content: string;
          emotional_tags?: string[];
          zone_id?: string | null;
          visibility?: PostVisibility;
        },
        Partial<{
          content: string;
          emotional_tags: string[];
          is_hidden: boolean;
          hidden_reason: string | null;
        }>
      >;
      reactions: Table<
        { id: string; post_id: string; user_id: string; kind: ReactionKind; created_at: string },
        { post_id: string; user_id: string; kind: ReactionKind }
      >;
      comments: Table<
        { id: string; post_id: string; author_id: string; content: string; is_hidden: boolean; created_at: string },
        { post_id: string; author_id: string; content: string },
        Partial<{ content: string; is_hidden: boolean }>
      >;
      personality_questions: Table<
        { id: string; prompt: string; order_index: number },
        { id?: string; prompt: string; order_index?: number }
      >;
      personality_answers: Table<
        { id: string; user_id: string; question_id: string; answer: string; created_at: string },
        { user_id: string; question_id: string; answer: string },
        Partial<{ answer: string }>
      >;
      subscriptions: Table<
        {
          id: string;
          user_id: string;
          plan: SubscriptionPlan;
          status: SubscriptionStatus;
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          amount_paise: number;
          started_at: string | null;
          expires_at: string | null;
          created_at: string;
        },
        {
          user_id: string;
          plan: SubscriptionPlan;
          status?: SubscriptionStatus;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          amount_paise: number;
          started_at?: string | null;
          expires_at?: string | null;
        },
        Partial<{
          status: SubscriptionStatus;
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          started_at: string | null;
          expires_at: string | null;
        }>
      >;
      reports: Table<
        {
          id: string;
          reporter_id: string;
          post_id: string | null;
          comment_id: string | null;
          reported_user_id: string | null;
          reason: string;
          status: ReportStatus;
          created_at: string;
          resolved_at: string | null;
          resolved_by: string | null;
        },
        {
          reporter_id: string;
          post_id?: string | null;
          comment_id?: string | null;
          reported_user_id?: string | null;
          reason: string;
        },
        Partial<{ status: ReportStatus; resolved_at: string; resolved_by: string }>
      >;
      admin_actions: Table<
        {
          id: string;
          admin_id: string;
          action_type: string;
          target_type: string;
          target_id: string | null;
          notes: string | null;
          created_at: string;
        },
        { admin_id: string; action_type: string; target_type: string; target_id?: string | null; notes?: string | null }
      >;
      post_rate_limits: Table<
        { user_id: string; day: string; post_count: number },
        { user_id: string; day?: string; post_count?: number }
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
