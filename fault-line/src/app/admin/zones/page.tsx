import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-guard";
import { createZone } from "./actions";
import { ZoneRow } from "./ZoneRow";

export default async function AdminZonesPage() {
  const ctx = await requireAdmin();
  if (!ctx) notFound();
  const { admin } = ctx;

  const { data: zones } = await admin.from("fault_zones").select("id, name, description, theme, is_featured, is_archived").order("name");

  const counts = new Map<string, number>();
  if (zones) {
    await Promise.all(
      zones.map(async (z) => {
        const { count } = await admin.from("zone_members").select("user_id", { count: "exact", head: true }).eq("zone_id", z.id);
        counts.set(z.id, count ?? 0);
      })
    );
  }

  return (
    <div>
      <h1 className="font-grotesk font-black uppercase text-3xl mb-8">FAULT ZONES</h1>

      <form action={createZone} className="border border-ink bg-paper p-5 mb-10 grid gap-4 md:grid-cols-[1fr_2fr_auto_auto]">
        <div>
          <label className="field-label" htmlFor="name">Name</label>
          <input id="name" name="name" required className="field" placeholder="THE OVERTHINKERS" />
        </div>
        <div>
          <label className="field-label" htmlFor="description">Description</label>
          <input id="description" name="description" className="field" placeholder="For the 2am replayers." />
        </div>
        <div>
          <label className="field-label" htmlFor="theme">Theme</label>
          <select id="theme" name="theme" className="field">
            <option value="ink">ink</option>
            <option value="red">red</option>
            <option value="blue">blue</option>
            <option value="acid">acid</option>
          </select>
        </div>
        <button type="submit" className="btn self-end">CREATE →</button>
      </form>

      <div className="flex flex-col gap-3">
        {(zones ?? []).map((z) => (
          <ZoneRow key={z.id} zone={z} memberCount={counts.get(z.id) ?? 0} />
        ))}
      </div>
    </div>
  );
}
