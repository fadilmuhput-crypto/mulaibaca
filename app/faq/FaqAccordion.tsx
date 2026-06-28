"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type Faq = { id: string; question: string; answer: string };

function AccordionItem({ question, answer }: Faq) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left"
      >
        <span className="text-sm font-semibold text-ink">{question}</span>
        <ChevronDown
          size={16}
          strokeWidth={2}
          className={`flex-shrink-0 text-ink-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-4 pb-4">
          <p className="text-sm text-ink-secondary leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="space-y-2">
      {faqs.map((faq) => (
        <AccordionItem key={faq.id} {...faq} />
      ))}
    </div>
  );
}
