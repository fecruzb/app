import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { Button } from "../primitives/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../primitives/table";
import { cn } from "../lib/utils";

export type DataTableSortValue = string | number | boolean | Date | null | undefined;

export type DataTableColumn<T> = {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  /**
   * Value used for client-side sorting. When set, the column header is
   * clickable (asc → desc → unsorted). Omit to leave the column unsortable.
   */
  sortValue?: (row: T) => DataTableSortValue;
  className?: string;
  /** Header cell class (e.g. text-right). */
  headerClassName?: string;
};

export type DataTableSort = {
  id: string;
  desc: boolean;
};

export type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[];
  /** Unique key for each row. Defaults to index. */
  getRowId?: (row: T, index: number) => string;
  /** Shown when `data` is empty. */
  empty?: ReactNode;
  className?: string;
  /**
   * Client-side page size. Omit (or pass `0`) for no pagination — all rows render.
   */
  pageSize?: number;
  /** i18n labels for the pager — required when `pageSize` is set. */
  pagination?: {
    previousLabel: string;
    nextLabel: string;
    /** e.g. `Page {{page}} of {{pages}}` — caller formats. */
    pageLabel: (page: number, pageCount: number) => string;
  };
  /** Initial sort. Cleared when the user cycles the same column a third time. */
  defaultSort?: DataTableSort;
};

function compareSortValues(a: DataTableSortValue, b: DataTableSortValue): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "boolean" && typeof b === "boolean") return Number(a) - Number(b);
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  return String(a).localeCompare(String(b), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

/**
 * Column-driven table with optional client-side sort + pagination.
 * Pass `sortValue` on a column to make its header sortable. Pass pager labels
 * from the app for i18n. For server-driven pages, sort/page the data yourself
 * and omit `pageSize` / `sortValue`.
 */
export function DataTable<T>({
  columns,
  data,
  getRowId,
  empty,
  className,
  pageSize = 0,
  pagination,
  defaultSort,
}: DataTableProps<T>) {
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<DataTableSort | null>(defaultSort ?? null);

  const sorted = useMemo(() => {
    if (!sort) return data;
    const col = columns.find((c) => c.id === sort.id);
    if (!col?.sortValue) return data;
    const getValue = col.sortValue;
    const copy = [...data];
    copy.sort((a, b) => {
      const result = compareSortValues(getValue(a), getValue(b));
      return sort.desc ? -result : result;
    });
    return copy;
  }, [columns, data, sort]);

  const paginated = pageSize > 0;
  const pageCount = paginated ? Math.max(1, Math.ceil(sorted.length / pageSize)) : 1;
  const safePage = Math.min(page, pageCount - 1);

  const rows = useMemo(() => {
    if (!paginated) return sorted;
    const start = safePage * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, paginated, pageSize, safePage]);

  function cycleSort(columnId: string) {
    setPage(0);
    setSort((current) => {
      if (current?.id !== columnId) return { id: columnId, desc: false };
      if (!current.desc) return { id: columnId, desc: true };
      return null;
    });
  }

  if (data.length === 0 && empty) {
    return <div className={className}>{empty}</div>;
  }

  return (
    <div className={cn("overflow-hidden rounded-xl border", className)}>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((col) => {
              const sortable = Boolean(col.sortValue);
              const active = sort?.id === col.id;
              const ariaSort = !sortable
                ? undefined
                : active
                  ? sort.desc
                    ? "descending"
                    : "ascending"
                  : "none";

              return (
                <TableHead
                  key={col.id}
                  className={col.headerClassName}
                  aria-sort={ariaSort}
                >
                  {sortable ? (
                    <button
                      type="button"
                      className={cn(
                        "-mx-1.5 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium",
                        "hover:bg-muted hover:text-foreground",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      )}
                      onClick={() => cycleSort(col.id)}
                    >
                      {col.header}
                      {active ? (
                        sort.desc ? (
                          <ArrowDownIcon className="size-3.5 shrink-0 opacity-70" />
                        ) : (
                          <ArrowUpIcon className="size-3.5 shrink-0 opacity-70" />
                        )
                      ) : (
                        <ArrowUpDownIcon className="size-3.5 shrink-0 opacity-40" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => {
            const absoluteIndex = paginated ? safePage * pageSize + index : index;
            const id = getRowId?.(row, absoluteIndex) ?? String(absoluteIndex);
            return (
              <TableRow key={id}>
                {columns.map((col) => (
                  <TableCell key={col.id} className={col.className}>
                    {col.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {paginated && pagination && sorted.length > pageSize ? (
        <div className="flex items-center justify-between gap-3 border-t px-3 py-2">
          <p className="text-xs text-muted-foreground">
            {pagination.pageLabel(safePage + 1, pageCount)}
          </p>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={safePage <= 0}
              aria-label={pagination.previousLabel}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <ChevronLeftIcon />
              {pagination.previousLabel}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={safePage >= pageCount - 1}
              aria-label={pagination.nextLabel}
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            >
              {pagination.nextLabel}
              <ChevronRightIcon />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
