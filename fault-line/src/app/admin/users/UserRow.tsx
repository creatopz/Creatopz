"use client";

import { useTransition } from "react";
import { setUserStatus } from "../moderation/actions";
import { setUserRole } from "./actions";
import { cx } from "@/lib/utils";

type User = { id: string; anonymous_username: string; role: string; status: string; created_at: string };

const STATUS_COLOR: Record<string, string> = { active: "#245CFF", warned: "#C7FF00", suspended: "#FF3B30", banned: "#FF3B30" };

export function UserRow({ user, canManageRoles }: { user: User; canManageRoles: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="border border-ink/20 bg-paper p-4 flex items-center justify-between gap-4 flex-wrap">
      <div>
        <p className="font-mono text-sm">{user.anonymous_username}</p>
        <p className="sys text-[10px] opacity-50">
          JOINED {new Date(user.created_at).toLocaleDateString("en-IN")} · ROLE: {user.role.toUpperCase()}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="tag-chip" style={{ borderColor: STATUS_COLOR[user.status], color: STATUS_COLOR[user.status] }}>
          {user.status.toUpperCase()}
        </span>

        {(["active", "warned", "suspended", "banned"] as const).map((s) => (
          <button
            key={s}
            type="button"
            disabled={pending || user.status === s}
            className={cx("tag-chip", user.status === s && "opacity-30")}
            onClick={() => startTransition(() => setUserStatus(user.id, s))}
          >
            {s}
          </button>
        ))}

        {canManageRoles && (
          <select
            defaultValue={user.role}
            disabled={pending}
            className="field !w-auto !p-2 text-xs"
            onChange={(e) => startTransition(() => setUserRole(user.id, e.target.value as "user" | "moderator" | "admin"))}
          >
            <option value="user">user</option>
            <option value="moderator">moderator</option>
            <option value="admin">admin</option>
          </select>
        )}
      </div>
    </div>
  );
}
