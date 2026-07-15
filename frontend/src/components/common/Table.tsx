import { type ReactNode } from 'react';

interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface GovernmentTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
}

export function GovernmentTable<T>({ columns, data, keyExtractor, emptyMessage = 'No records found' }: GovernmentTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gov-muted text-sm">{emptyMessage}</div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-gov-border dark:border-slate-700">
      <table className="w-full text-sm">
        <thead className="gov-table-head">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={`text-left px-4 py-3 ${col.className || ''}`} scope="col">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gov-border dark:divide-slate-700 bg-white dark:bg-slate-900">
          {data.map((row) => (
            <tr
              key={keyExtractor(row)}
              className="hover:bg-gov-bg dark:hover:bg-slate-800/50 transition-colors duration-150"
            >
              {columns.map((col) => (
                <td key={col.key} className={`px-4 py-3.5 text-gov-text dark:text-slate-200 ${col.className || ''}`}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-center gap-2 mt-6" aria-label="Pagination">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="px-3 py-1.5 text-sm font-medium border border-gov-border rounded-md hover:bg-gov-bg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Previous
      </button>
      <span className="px-3 py-1.5 text-sm text-gov-muted">
        Page <span className="font-semibold text-gov-text">{page}</span> of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="px-3 py-1.5 text-sm font-medium border border-gov-border rounded-md hover:bg-gov-bg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Next
      </button>
    </nav>
  );
}
