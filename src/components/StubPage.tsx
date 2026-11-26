import { Notice } from "./Notice";

export function StubPage({ title, stage, planned }: { title: string; stage: string; planned: string[] }) {
  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-4xl">{title}</h1>
      <div className="mt-6"><Notice>Not implemented yet — scheduled for {stage}.</Notice></div>
      <div className="card mt-6 p-6">
        <p className="label">Planned</p>
        <ul className="mt-2 list-inside list-disc space-y-1.5 text-sm text-ink-dim">
          {planned.map((p) => <li key={p}>{p}</li>)}
        </ul>
      </div>
    </div>
  );
}
