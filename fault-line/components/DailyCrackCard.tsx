import PixelAvatar from "@/components/PixelAvatar";
import { AvatarConfig } from "@/lib/types";

export default function DailyCrackCard({
  prompt,
  answer,
  username,
  avatarConfig,
}: {
  prompt: string;
  answer: string;
  username: string;
  avatarConfig?: AvatarConfig;
}) {
  return (
    <div className="mx-auto w-full max-w-md border-2 border-ink bg-paper p-8 shadow-[6px_6px_0_#111]">
      <p className="font-mono text-[10px] uppercase tracking-widest text-crack">DAILY CRACK</p>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-grey">{prompt}</p>
      <p className="mt-6 font-grotesk text-2xl font-black leading-tight text-ink">
        &ldquo;{answer}&rdquo;
      </p>
      <div className="mt-8 flex items-center gap-3 border-t-2 border-ink pt-4">
        {avatarConfig && <PixelAvatar config={avatarConfig} size={28} />}
        <p className="font-mono text-[10px] uppercase tracking-widest text-grey">
          {username} — FROM THE FAULT LINE
        </p>
      </div>
    </div>
  );
}
