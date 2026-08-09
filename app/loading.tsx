export default function Loading() {
  return (
    <main
      className="min-h-screen bg-[#f4f7f5] text-[#14231c]"
      aria-busy="true"
      aria-label="Cargando contenido"
    >
      {/* HERO SKELETON */}

      <section className="bg-[#07130f] px-5 pb-14 pt-32 sm:px-6 sm:pb-20 sm:pt-36 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse">
            <div className="h-3 w-28 rounded-full bg-lime-300/20" />

            <div className="mt-6 h-10 max-w-xl rounded-xl bg-white/10 sm:h-12" />

            <div className="mt-3 h-10 max-w-md rounded-xl bg-white/10 sm:h-12" />

            <div className="mt-7 h-4 max-w-lg rounded-full bg-white/[0.07]" />

            <div className="mt-3 h-4 max-w-sm rounded-full bg-white/[0.07]" />
          </div>
        </div>
      </section>

      {/* CONTENIDO */}

      <section className="px-5 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">

          <div className="animate-pulse">
            <div className="h-3 w-24 rounded-full bg-[#0f5132]/15" />

            <div className="mt-4 h-8 w-64 max-w-full rounded-lg bg-[#dfe7e2]" />

            <div className="mt-3 h-4 w-80 max-w-full rounded-full bg-[#e4ebe7]" />
          </div>

          <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <article
                key={index}
                className="overflow-hidden rounded-[1.75rem] border border-[#e0e7e3] bg-white"
              >
                <div className="aspect-[16/10] animate-pulse bg-[#e4eae6]" />

                <div className="p-5 sm:p-6">
                  <div className="animate-pulse">
                    <div className="h-3 w-24 rounded-full bg-[#dfe7e2]" />

                    <div className="mt-4 h-6 w-3/4 rounded-lg bg-[#dce5df]" />

                    <div className="mt-5 h-3 w-full rounded-full bg-[#e7ece9]" />

                    <div className="mt-2 h-3 w-5/6 rounded-full bg-[#e7ece9]" />

                    <div className="mt-7 h-12 w-full rounded-full bg-[#e1e8e4]" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <span className="sr-only">
        Cargando tu próxima aventura...
      </span>
    </main>
  );
}