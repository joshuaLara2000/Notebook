import { Link2, Mail, Phone } from "lucide-react";

import type { Insight, InsightType } from "../lib/insights";

const ICONS: Record<InsightType, typeof Link2> = {
  link: Link2,
  email: Mail,
  phone: Phone,
};

export function InsightsRow({ insights }: { insights: Insight[] }) {
  return (
    <div className="flex flex-wrap gap-1 px-2 pb-2">
      {insights.map((insight, idx) => {
        const Icon = ICONS[insight.type];
        return (
          <a
            key={`${insight.type}-${idx}`}
            href={insight.href}
            target="_blank"
            rel="noreferrer"
            onPointerDown={(e) => e.stopPropagation()}
            className="bg-black/5 text-postit-ink/80 hover:bg-black/10 flex max-w-full items-center gap-1 rounded-full px-2 py-0.5 text-xs transition"
            title={insight.label}
          >
            <Icon className="size-3 shrink-0" />
            <span className="truncate">{insight.label}</span>
          </a>
        );
      })}
    </div>
  );
}
