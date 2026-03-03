"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { ArrowUpRight, ArrowDownLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { TransferDialog } from "@/components/dashboard/transfer-dialog";
import { TransactionDetailDialog } from "@/components/shared/transaction-detail-dialog";
import { getStatusLabel, getStatusBadgeVariant } from "@/lib/transaction-utils";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailTx, setDetailTx] = useState<any>(null);

  async function fetchTransactions() {
    try {
      const res = await fetch("/api/transactions");
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
      }
    } catch {
      toast.error("Error al cargar transacciones");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl md:text-2xl font-bold">Transacciones</h1>
        <TransferDialog onSuccess={fetchTransactions} transactions={transactions} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No hay transacciones
            </p>
          ) : (
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
                        ${tx.amount?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>De: {tx.fromAccount?.accountNumber || "-"}</p>
                      <p>A: {tx.toAccount?.accountNumber || tx.toAccountNumber || "-"}</p>
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
                      <TableHead>De</TableHead>
                      <TableHead>A</TableHead>
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
                        <TableCell>
                          {tx.fromAccount?.accountNumber || "-"}
                        </TableCell>
                        <TableCell>
                          {tx.toAccount?.accountNumber || tx.toAccountNumber || "-"}
                        </TableCell>
                        <TableCell className="font-medium">
                          ${tx.amount?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
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
            </>
          )}
        </CardContent>
      </Card>

      <TransactionDetailDialog
        transaction={detailTx}
        role="client"
        open={!!detailTx}
        onOpenChange={(open) => { if (!open) setDetailTx(null); }}
        onUpdate={fetchTransactions}
      />
    </div>
  );
}
