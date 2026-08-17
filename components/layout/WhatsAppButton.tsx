import {
  MessageCircle,
} from "lucide-react";

import { siteContent } from "@/data/site-content";
import { createWhatsAppUrl } from "@/lib/whatsapp";

export default function WhatsAppButton() {
  const whatsappUrl = createWhatsAppUrl(
    siteContent.contact.whatsapp,
    "¡Hola Ruticas RD! Vi su página web y me gustaría recibir información sobre sus próximas excursiones.",
  );

  if (!whatsappUrl) {
    return null;
  }

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noreferrer"
      aria-label="Hablar con Ruticas RD por WhatsApp"
      className="
        fixed bottom-[calc(6.5rem+env(safe-area-inset-bottom))]
        right-4 z-40
        flex h-14 w-14
        touch-manipulation select-none
        items-center justify-center
        rounded-full
        bg-[#25D366]
        text-white
        shadow-[0_12px_35px_rgba(0,0,0,0.28)]
        transition
        active:scale-95
        sm:right-6
        lg:bottom-6
        lg:h-auto lg:w-auto lg:gap-2
        lg:px-5 lg:py-3.5
        lg:hover:-translate-y-1
      "
    >
      <MessageCircle
        size={24}
        strokeWidth={2.4}
      />

      <span className="hidden text-sm font-black lg:block">
        WhatsApp
      </span>
    </a>
  );
}
