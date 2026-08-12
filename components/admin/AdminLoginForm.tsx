"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from "lucide-react";

import {
  loginAction,
  type LoginState,
} from "@/app/admin/actions";

const initialState: LoginState = {};

export default function AdminLoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={action} className="mt-8 space-y-5">
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-bold text-[#294238]"
        >
          Correo electrónico
        </label>
        <div className="relative">
          <Mail
            size={19}
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6d8178]"
          />
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            disabled={pending}
            placeholder="ruticasrd@yahoo.com"
            className="min-h-14 w-full rounded-2xl border border-[#d7e2dc] bg-[#f7faf8] py-3 pl-12 pr-4 text-base text-[#14231c] outline-none transition placeholder:text-[#91a199] focus:border-[#0f5132] focus:ring-4 focus:ring-[#0f5132]/10 disabled:cursor-wait disabled:opacity-70"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-bold text-[#294238]"
        >
          Contraseña
        </label>
        <div className="relative">
          <LockKeyhole
            size={19}
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6d8178]"
          />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            disabled={pending}
            className="min-h-14 w-full rounded-2xl border border-[#d7e2dc] bg-[#f7faf8] py-3 pl-12 pr-14 text-base text-[#14231c] outline-none transition focus:border-[#0f5132] focus:ring-4 focus:ring-[#0f5132]/10 disabled:cursor-wait disabled:opacity-70"
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            disabled={pending}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 touch-manipulation items-center justify-center rounded-xl text-[#587066] transition active:bg-[#e7eee9] disabled:opacity-50 sm:hover:bg-[#e7eee9]"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      {state.message && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold leading-6 text-red-700"
        >
          {state.message}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-14 w-full touch-manipulation items-center justify-center gap-2 rounded-full bg-lime-400 px-6 py-3.5 text-base font-black text-[#07130f] shadow-lg shadow-[#07130f]/15 transition active:scale-[0.98] active:bg-lime-300 disabled:cursor-wait disabled:opacity-70 sm:hover:bg-lime-300"
      >
        {pending && <LoaderCircle size={20} className="animate-spin" />}
        {pending ? "Verificando acceso..." : "Iniciar sesión"}
      </button>
    </form>
  );
}
