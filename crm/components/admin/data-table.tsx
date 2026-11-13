"use client";

import * as React from "react";
import { EmptyRow, TBody, THead, Table, TableWrap, Td, Th, Tr } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type Column<T> = {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
  hideOnMobile?: boolean;
};

export function DataTable<T extends { id: string }>({
  rows,
  columns,
  empty = "Aucun résultat.",
  onRowClick,
  footer,
}: {
  rows: T[];
  columns: Column<T>[];
  empty?: string;
  onRowClick?: (row: T) => void;
  footer?: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-ink/8 bg-white shadow-[0_2px_10px_rgba(18,43,67,0.04)]">
      <TableWrap>
        <Table>
          <THead>
            <tr>
              {columns.map((column) => (
                <Th key={column.key} className={cn(column.hideOnMobile && "hidden md:table-cell")}>
                  {column.header}
                </Th>
              ))}
            </tr>
          </THead>
          <TBody>
            {rows.length === 0 ? (
              <EmptyRow colSpan={columns.length} message={empty} />
            ) : (
              rows.map((row) => (
                <Tr
                  key={row.id}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={onRowClick ? "cursor-pointer" : undefined}
                >
                  {columns.map((column) => (
                    <Td
                      key={column.key}
                      className={cn(column.className, column.hideOnMobile && "hidden md:table-cell")}
                    >
                      {column.cell(row)}
                    </Td>
                  ))}
                </Tr>
              ))
            )}
          </TBody>
        </Table>
      </TableWrap>
      {footer ? (
        <div className="flex items-center justify-between border-t border-ink/8 px-4 py-3 text-[11.5px] text-muted">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
