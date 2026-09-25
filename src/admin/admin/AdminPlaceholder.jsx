export default function AdminPlaceholder({ title }) {
  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Admin</p>
      <h1 className="mt-3 font-display text-4xl font-semibold text-ink">{title}</h1>
      <p className="mt-4 max-w-xl text-neutral-600">This editor is the next admin implementation step.</p>
    </section>
  )
}
