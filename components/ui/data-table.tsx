import { cn } from "@/lib/utils/cn";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
  hideOnMobile?: boolean;
}

/**
 * Renders a full table on sm+ screens; below that, each row becomes a
 * labelled card so nothing overflows the viewport on mobile admin use.
 */
export function DataTable<T extends { id: string }>({
  columns,
  rows,
  emptyMessage = "No records found.",
}: {
  columns: Column<T>[];
  rows: T[];
  emptyMessage?: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="border border-dashed border-rail-line px-6 py-14 text-center text-rail-silver">
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      <table className="hidden sm:table w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-rail-line text-left text-xs uppercase tracking-wide text-rail-silver">
            {columns.map((col) => (
              <th key={col.key} className={cn("py-3 pr-4 font-semibold", col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-rail-line/60 hover:bg-white/[0.02]">
              {columns.map((col) => (
                <td key={col.key} className={cn("py-3.5 pr-4 align-middle", col.className)}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="sm:hidden space-y-3">
        {rows.map((row) => (
          <div key={row.id} className="border border-rail-line bg-rail-navy/50 p-4 space-y-2">
            {columns
              .filter((c) => !c.hideOnMobile)
              .map((col) => (
                <div key={col.key} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-xs uppercase tracking-wide text-rail-silver">
                    {col.header}
                  </span>
                  <span className="text-right">{col.render(row)}</span>
                </div>
              ))}
          </div>
        ))}
      </div>
    </>
  );
}
