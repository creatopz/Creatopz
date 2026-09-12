-- Migration 006: close a gap in the admin-role lock.
--
-- migration_005 (and the equivalent hardening already applied to the live
-- project as "harden_profiles_insert_policy" / "lock_signup_role_to_creator_or_brand")
-- stopped anyone who is NOT an admin from ever setting role='admin'. It did
-- not stop an EXISTING admin from promoting a second account. This
-- migration closes that: role='admin' is now only ever accepted for
-- creatopz.in@gmail.com, regardless of who makes the request.
--
-- Safe to run on a live project — it only replaces the trigger function
-- body, no data is touched.

create or replace function public.prevent_role_self_change()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
begin
  if new.role is distinct from old.role then
    if not is_admin() then
      raise exception 'Only an admin can change a user role.';
    end if;
    if new.role = 'admin' and new.email is distinct from 'creatopz.in@gmail.com' then
      raise exception 'Only creatopz.in@gmail.com may hold the admin role.';
    end if;
  end if;
  return new;
end;
$function$;
