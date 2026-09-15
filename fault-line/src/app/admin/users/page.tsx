import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-guard";
import { UserRow } from "./UserRow";

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const ctx = await requireAdmin();
  if (!ctx) notFound();
  const { admin, profile } = ctx;
  const { q } = await searchParams;

  let query = admin.from("profiles").select("id, anonymous_username, role, status, created_at").order("created_at", { ascending: false }).limit(50);
  if (q) query = query.ilike("anonymous_username", `%${q}%`);
  const { data: users } = await query;

  return (
    <div>
      <h1 className="font-grotesk font-black uppercase text-3xl mb-8">USERS</h1>

      <form className="mb-8 flex gap-3 max-w-md">
        <input name="q" defaultValue={q ?? ""} placeholder="search by username…" className="field" />
        <button type="submit" className="btn btn-outline whitespace-nowrap">SEARCH</button>
      </form>

      <div className="flex flex-col gap-2">
        {(users ?? []).map((u) => (
          <UserRow key={u.id} user={u} canManageRoles={profile.role === "admin"} />
        ))}
        {(users ?? []).length === 0 && <p className="opacity-50 text-sm">No users match.</p>}
      </div>
    </div>
  );
}
