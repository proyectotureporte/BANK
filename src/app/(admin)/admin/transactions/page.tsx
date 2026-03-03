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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Loader2,
  Check,
  X,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { getStatusLabel, getStatusBadgeVariant } from "@/lib/transaction-utils";
import { TransactionDetailDialog } from "@/components/shared/transaction-detail-dialog";
import { RejectDialog } from "@/components/admin/reject-dialog";

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [detailTx, setDetailTx] = useState<any>(null);
  const [rejectTxId, setRejectTxId] = useState<string | null>(null);

  async function fetchTransactions() {
    try {
      const res = await fetch("/api/admin/transactions");
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

  async function handleApprove(txId: string) {
    setProcessing(txId);
    try {
      const res = await fetch("/api/admin/transactions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: txId, status: "approved" }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al procesar");
      }

      toast.success("Transacción aprobada");
      fetchTransactions();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setProcessing(null);
    }
  }

  const pending = transactions.filter(
    (t) => t.status === "pending" || t.status === "in_review"
  );
  const processed = transactions.filter(
    (t) => t.status === "approved" || t.status === "rejected"
  );

  function TransactionTable({
    items,
    showActions,
  }: {
    items: any[];
    showActions?: boolean;
  }) {
    if (items.length === 0) {
      return (
        <p className="text-sm text-muted-foreground text-center py-8">
          No hay transacciones
        </p>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipo</TableHead>
            <TableHead>De</TableHead>
            <TableHead>A</TableHead>
            <TableHead>Monto</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((tx: any) => (
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
              <TableCell>
                <div>
                  <p className="text-sm">
                    {tx.fromAccount?.accountNumber || "-"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {tx.fromAccount?.ownerName || ""}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="text-sm">
                    {tx.toAccount?.accountNumber || tx.toAccountNumber || "-"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {tx.toAccount?.ownerName || tx.beneficiaryName || ""}
                  </p>
                </div>
              </TableCell>
              <TableCell className="font-medium">
                $
                {tx.amount?.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </TableCell>
              <TableCell>{tx.description || "-"}</TableCell>
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
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDetailTx(tx)}
                    title="Ver Detalles"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  {showActions && (
                    <>
                      <Button
                        size="sm"
                        variant="default"
                        disabled={processing === tx._id}
                        onClick={() => handleApprove(tx._id)}
                        title="Aprobar"
                      >
                        {processing === tx._id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Check className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={processing === tx._id}
                        onClick={() => setRejectTxId(tx._id)}
                        title="Denegar"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gestión de Transacciones</h1>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">
              Pendientes ({pending.length})
            </TabsTrigger>
            <TabsTrigger value="processed">
              Procesadas ({processed.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Transacciones Pendientes y En Revisión</CardTitle>
              </CardHeader>
              <CardContent>
                <TransactionTable items={pending} showActions />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="processed">
            <Card>
              <CardHeader>
                <CardTitle>Transacciones Procesadas</CardTitle>
              </CardHeader>
              <CardContent>
                <TransactionTable items={processed} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Detail dialog */}
      <TransactionDetailDialog
        transaction={detailTx}
        role="admin"
        open={!!detailTx}
        onOpenChange={(open) => { if (!open) setDetailTx(null); }}
        onUpdate={fetchTransactions}
      />

      {/* Reject dialog */}
      {rejectTxId && (
        <RejectDialog
          transactionId={rejectTxId}
          open={!!rejectTxId}
          onOpenChange={(open) => { if (!open) setRejectTxId(null); }}
          onSuccess={fetchTransactions}
        />
      )}
    </div>
  );
}
