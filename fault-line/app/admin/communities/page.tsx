import { requireAdmin } from "@/lib/admin";
import CommunityAdminForm from "@/components/admin/CommunityAdminForm";
import DeleteCommunityButton from "@/components/admin/DeleteCommunityButton";

export default async function AdminCommunitiesPage() {
  const { supabase } = await requireAdmin();
  const { data: communities } = await supabase.from("communities").select("*").order("name");

  return (
    <div>
      <h1 className="font-grotesk text-3xl font-black uppercase">Communities.</h1>

      <div className="mt-6 max-w-md border-2 border-paper/20 p-5">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-paper/50">CREATE NEW</p>
        <CommunityAdminForm />
      </div>

      <div className="mt-8 space-y-2">
        {(communities ?? []).map((c) => (
          <div key={c.id} className="flex items-center justify-between border-2 border-paper/20 p-3 font-mono text-xs">
            <span>
              {c.icon} {c.name} <span className="text-paper/40">/{c.slug}</span>
            </span>
            <DeleteCommunityButton id={c.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
