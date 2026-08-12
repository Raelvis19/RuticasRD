import type { LucideIcon } from "lucide-react";
import Link from "next/link";

interface AdminPlaceholderProps {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  action?: {
    label: string;
    href: string;
  };
}

export default function AdminPlaceholder({
  eyebrow,
  title,
  description,
  icon: Icon,
  action,
}: AdminPlaceholderProps) {
  return (
    <section className="rounded-[2rem] border border-[#dce6e0] bg-white p-6 shadow-sm sm:p-9">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e6f0ea] text-[#0f5132]">
        <Icon size={26} aria-hidden="true" />
      </div>
      <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-[#0f5132]">
        {eyebrow}
      </p>
      <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl leading-7 text-[#667a70]">{description}</p>

      {action && (
        <Link
          href={action.href}
          className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-[#0f5132] px-6 py-3 font-black text-white transition active:scale-[0.98] sm:hover:bg-[#0b4027]"
        >
          {action.label}
        </Link>
      )}
    </section>
  );
}
