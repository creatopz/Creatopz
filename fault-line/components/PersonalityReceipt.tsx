"use client";

type ReceiptData = {
  username: string;
  publicConfidence: number;
  actualConfidence: number;
  overthinkingCapacity: string;
  actNormal: string;
  primaryFault: string;
};

export default function PersonalityReceipt({ data }: { data: ReceiptData }) {
  return (
    <div
      id="human-receipt"
      className="mx-auto w-full max-w-xs border-2 border-dashed border-ink bg-white p-6 font-mono text-xs text-ink shadow-[4px_4px_0_#111]"
    >
      <p className="text-center text-sm font-bold uppercase tracking-widest">HUMAN RECEIPT</p>
      <div className="my-3 border-t border-dashed border-ink" />
      <Row label="NAME" value={"█".repeat(Math.max(4, data.username.length))} />
      <Row label="PUBLIC CONFIDENCE" value={`${data.publicConfidence}%`} />
      <Row label="ACTUAL CONFIDENCE" value={`${data.actualConfidence}%`} />
      <Row label="OVERTHINKING CAPACITY" value={data.overthinkingCapacity} />
      <Row label="ABILITY TO ACT NORMAL" value={data.actNormal} />
      <Row label={`TIMES SAID "I'M FINE"`} value="CLASSIFIED" />
      <Row label="PRIMARY FAULT" value={data.primaryFault} />
      <div className="my-3 border-t border-dashed border-ink" />
      <p className="text-center text-[10px] text-grey">FAULT LINE — {new Date().toLocaleDateString()}</p>
      <p className="text-center text-[10px] text-grey">THANK YOU FOR NOT BEING OKAY</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2 py-1">
      <span className="text-grey">{label}:</span>
      <span className="text-right font-bold">{value}</span>
    </div>
  );
}
