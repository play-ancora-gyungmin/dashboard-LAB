"use client";

import { FeedCard } from "@/features/info-hub/components/FeedCard";
import type { FeedItem } from "@/lib/types";

export function FeedCardGrid({ items }: { items: FeedItem[] }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {items.map((item) => (
        <FeedCard key={item.id} item={item} />
      ))}
    </div>
  );
}
