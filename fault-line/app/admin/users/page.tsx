import { requireStaff } from "@/lib/admin";
import UserRow from "@/components/admin/UserRow";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const { supabase } = await requireStaff();
  const q = searchParams.q?.trim() ?? "";

  let query = supabase
    .from("profiles")
    .select("id, username, role, suspended, created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  if (q) query = query.ilike("username", `%${q}%`);

  const { data: users } = await query;

  return (
    <div>
      <h1 className="font-grotesk text-3xl font-black uppercase">Users.</h1>
      <form className="mt-4">
        <input
          name="q"
          defaultValue={q}
          placeholder="search username..."
          className="w-full max-w-sm border-2 border-paper/30 bg-transparent px-3 py-2 font-mono text-sm text-paper outline-none placeholder:text-paper/40"
        />
      </form>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[600px] font-mono text-xs">
          <thead>
            <tr className="border-b-2 border-paper/20 text-left uppercase tracking-widest text-paper/50">
              <th className="py-2">Username</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((u) => (
              <UserRow key={u.id} user={u} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
