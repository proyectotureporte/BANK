"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { getStatusLabel, getStatusBadgeVariant } from "@/lib/transaction-utils";
import { TransactionDetailDialog } from "@/components/shared/transaction-detail-dialog";

export function RecentTransactions({ transactions }: { transactions: any[] }) {
  const [detailTx, setDetailTx] = useState<any>(null);

  if (transactions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No hay transacciones recientes
      </p>
    );
  }

  return (
    <>
      {/* Mobile card view */}
      <div className="space-y-3 md:hidden">
        {transactions.map((tx: any) => (
          <div
            key={tx._id}
            className="rounded-lg border p-4 space-y-2 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => setDetailTx(tx)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {tx.type === "deposit" ? (
                  <ArrowDownLeft className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowUpRight className="h-4 w-4 text-red-500" />
                )}
                <span className="capitalize text-sm font-medium">{tx.type}</span>
              </div>
              <span className="font-semibold">
                ₿{tx.amount?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{tx.description || "-"}</p>
            <div className="flex items-center justify-between">
              <Badge variant={getStatusBadgeVariant(tx.status)}>
                {getStatusLabel(tx.status)}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {tx.createdAt
                  ? new Date(tx.createdAt).toLocaleDateString("es")
                  : "-"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx: any) => (
              <TableRow key={tx._id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {tx.type === "deposit" ? (
                      <ArrowDownLeft className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-red-500" />
                    )}
                    <span className="capitalize">{tx.type}</span>
                  </div>
                </TableCell>
                <TableCell>{tx.description || "-"}</TableCell>
                <TableCell className="font-medium">
                  ₿{tx.amount?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(tx.status)}>
                    {getStatusLabel(tx.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {tx.createdAt
                    ? new Date(tx.createdAt).toLocaleDateString("es")
                    : "-"}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="ghost"
                    className={tx.status === "rejected" ? "text-destructive hover:text-destructive" : ""}
                    onClick={() => setDetailTx(tx)}
                  >
                    {tx.status === "rejected" ? "Ver Motivo" : "Ver Detalles"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <TransactionDetailDialog
        transaction={detailTx}
        role="client"
        open={!!detailTx}
        onOpenChange={(open) => { if (!open) setDetailTx(null); }}
      />
    </>
  );
}
