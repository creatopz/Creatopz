import AuthShell from "@/components/AuthShell";

export default function CheckEmailPage() {
  return (
    <AuthShell eyebrow="[ ONE MORE STEP ]" title="Check your inbox.">
      <p className="text-ink/80">
        We sent you a link. Click it and you&rsquo;ll land right back here, signed in.
      </p>
    </AuthShell>
  );
}
