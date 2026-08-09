"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import type { Faq } from "@/data/faqs";

interface FaqAccordionProps {
  items: Faq[];
}

export default function FaqAccordion({
  items,
}: FaqAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  function toggleFaq(id: string) {
    setOpenId((current) =>
      current === id ? null : id,
    );
  }

  return (
    <div className="space-y-3">
      {items.map((faq) => {
        const isOpen = openId === faq.id;

        return (
          <article
            key={faq.id}
            className="overflow-hidden rounded-2xl border border-[#dce5df] bg-white shadow-sm"
          >
            <h3>
              <button
                type="button"
                onClick={() => toggleFaq(faq.id)}
                aria-expanded={isOpen}
                aria-controls={`faq-${faq.id}`}
                className="
                  flex min-h-[68px] w-full
                  touch-manipulation items-center
                  justify-between gap-5
                  px-5 py-4 text-left
                  transition
                  active:bg-[#f4f7f5]
                  sm:px-6
                "
              >
                <span className="text-[15px] font-black leading-6 text-[#14231c] sm:text-base">
                  {faq.question}
                </span>

                <span
                  className={`
                    flex h-10 w-10 shrink-0
                    items-center justify-center
                    rounded-full
                    bg-[#edf5f0]
                    text-[#0f5132]
                    transition-transform duration-300
                    ${isOpen ? "rotate-180" : ""}
                  `}
                >
                  <ChevronDown size={20} />
                </span>
              </button>
            </h3>

            <div
              id={`faq-${faq.id}`}
              className={`
                grid transition-all duration-300
                ${
                  isOpen
                    ? "grid-rows-[1fr]"
                    : "grid-rows-[0fr]"
                }
              `}
            >
              <div className="overflow-hidden">
                <div className="border-t border-[#edf1ee] px-5 pb-6 pt-5 sm:px-6">
                  <p className="text-sm leading-7 text-[#62756c] sm:text-[15px]">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}