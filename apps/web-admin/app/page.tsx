const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

export default function Home() {
  return (
    <main className="min-h-screen bg-stone-50 px-6 py-8 text-stone-950">
      <section className="mx-auto flex max-w-5xl flex-col gap-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-rose-700">Closira Admin</p>
          <h1 className="mt-2 text-3xl font-semibold">Foundation dashboard</h1>
          <p className="mt-3 max-w-2xl text-stone-700">
            Phase 1 shell for operational monitoring. Full authentication and dynamic admin modules arrive in later phases.
          </p>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-medium">API endpoint</h2>
          <p className="mt-2 font-mono text-sm text-stone-700">{apiUrl}/health</p>
        </div>
      </section>
    </main>
  );
}

