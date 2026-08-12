import { CheckCircle2, ClipboardList, Map, ShieldCheck } from "lucide-react";

import { requireAdmin } from "@/lib/auth/admin";

const nextSteps = [
  {
    title: "Gestión de tours",
    description: "Crear, editar y publicar excursiones desde el panel.",
    icon: Map,
  },
  {
    title: "Reservaciones",
    description: "Consultar solicitudes, participantes y estados.",
    icon: ClipboardList,
  },
];

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0f5132]">
        Dashboard
      </p>
      <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
        Bienvenido, {admin.fullName}
      </h1>
      <p className="mt-3 max-w-2xl leading-7 text-[#667a70]">
        El acceso administrativo ya está conectado a Supabase y protegido por
        sesión, rol y estado de la cuenta.
      </p>

      <section className="mt-7 rounded-[2rem] bg-[#07130f] p-6 text-white shadow-xl shadow-[#07130f]/10 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-lime-300">
              <ShieldCheck size={22} aria-hidden="true" />
              <p className="font-black">Acceso seguro configurado</p>
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">
              Tu sesión se valida en el servidor y todas las páginas del panel
              requieren un perfil administrador activo.
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-lime-400/15 px-4 py-2 text-sm font-bold text-lime-300">
            <CheckCircle2 size={18} aria-hidden="true" />
            Operativo
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {nextSteps.map((item) => {
          const Icon = item.icon;

          return (
            <article
              key={item.title}
              className="rounded-[1.75rem] border border-[#dce6e0] bg-white p-6 shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e6f0ea] text-[#0f5132]">
                <Icon size={23} aria-hidden="true" />
              </div>
              <h2 className="mt-5 text-xl font-black">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#667a70]">
                {item.description}
              </p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
