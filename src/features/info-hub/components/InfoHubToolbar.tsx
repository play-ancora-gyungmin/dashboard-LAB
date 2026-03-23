"use client";

import { useLocale } from "@/components/layout/LocaleProvider";
import { getInfoHubCopy } from "@/features/info-hub/copy";

interface InfoHubToolbarProps {
  loading: boolean;
  onRefresh: () => void;
  copy?: ReturnType<typeof getInfoHubCopy>;
}

export function InfoHubToolbar({ loading, onRefresh, copy: providedCopy }: InfoHubToolbarProps) {
  const { locale } = useLocale();
  const copy = providedCopy ?? getInfoHubCopy(locale);

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-white">{copy.toolbarTitle}</p>
        <p className="mt-1 text-xs text-white/45">{copy.toolbarDescription}</p>
      </div>
      <button
        type="button"
        onClick={onRefresh}
        className="rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/80 hover:bg-black/30"
      >
        {loading ? copy.refreshing : copy.refresh}
      </button>
    </div>
  );
}
