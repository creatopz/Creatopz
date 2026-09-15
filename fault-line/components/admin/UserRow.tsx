"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { suspendUser, unsuspendUser, deleteUser } from "@/app/admin/actions";

type User = {
  id: string;
  username: string;
  role: string;
  suspended: boolean;
  created_at: string;
};

export default function UserRow({ user }: { user: User }) {
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <tr className="border-b border-paper/10">
      <td className="py-2.5">
        <Link href={`/profile/${user.username}`} className="hover:text-acid">
          @{user.username}
        </Link>
      </td>
      <td className="uppercase text-paper/70">{user.role}</td>
      <td>
        {user.suspended ? (
          <span className="text-crack">SUSPENDED</span>
        ) : (
          <span className="text-paper/50">ACTIVE</span>
        )}
      </td>
      <td className="text-paper/50">{new Date(user.created_at).toLocaleDateString()}</td>
      <td className="space-x-2 py-2.5 text-right">
        {user.suspended ? (
          <button
            disabled={pending}
            onClick={() => startTransition(() => unsuspendUser(user.id))}
            className="border border-paper/30 px-2 py-1 uppercase hover:border-acid hover:text-acid"
          >
            unsuspend
          </button>
        ) : (
          <button
            disabled={pending}
            onClick={() => startTransition(() => suspendUser(user.id, "Admin action"))}
            className="border border-paper/30 px-2 py-1 uppercase hover:border-crack hover:text-crack"
          >
            suspend
          </button>
        )}
        {confirmDelete ? (
          <button
            disabled={pending}
            onClick={() => startTransition(() => deleteUser(user.id))}
            className="border border-crack bg-crack px-2 py-1 uppercase text-paper"
          >
            confirm delete
          </button>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="border border-paper/30 px-2 py-1 uppercase hover:border-crack hover:text-crack"
          >
            delete
          </button>
        )}
      </td>
    </tr>
  );
}
