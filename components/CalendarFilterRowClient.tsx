"use client";

import { CalendarDays, Filter, List } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";

type Props = {
  dataQuality: string;
};

const filters = [
  { key: "month", label: "2025 年 4 月⌄", Icon: CalendarDays },
  { key: "status", label: "全部状态⌄", Icon: Filter },
  { key: "type", label: "全部题型⌄", Icon: List }
];

export default function CalendarFilterRowClient({ dataQuality }: Props) {
  const [active, setActive] = useState("month");

  return (
    <div className="filter-row" data-active-filter={active} data-quality={dataQuality}>
      {filters.map(({ key, label, Icon }) => (
        <button
          aria-pressed={active === key}
          className={cn("filter-pill", active === key && "active")}
          key={key}
          type="button"
          onClick={() => setActive(key)}
        >
          <Icon size={20} color="#4b35ff" />
          {label}
        </button>
      ))}
    </div>
  );
}
