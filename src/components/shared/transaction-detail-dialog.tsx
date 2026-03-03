"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, Upload, FileText, AlertTriangle, Download } from "lucide-react";
import { toast } from "sonner";
import { getStatusLabel, getStatusBadgeVariant } from "@/lib/transaction-utils";

interface TransactionDetailDialogProps {
  transaction: any;
  role: "admin" | "client";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}

export function TransactionDetailDialog({
  transaction: tx,
  role,
  open,
  onOpenChange,
  onUpdate,
}: TransactionDetailDialogProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmitReview() {
    if (!selectedFile) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("transactionId", tx._id);
      formData.append("file", selectedFile);

      const res = await fetch("/api/transactions/review", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al enviar documento");
      }

      toast.success("Documento enviado a revisión");
      setSelectedFile(null);
      onOpenChange(false);
      onUpdate?.();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  }

  if (!tx) return null;

  const isRejected = tx.status === "rejected";
  const isInReview = tx.status === "in_review";

  function DetailRow({ label, value }: { label: string; value?: string | null }) {
    if (!value) return null;
    return (
      <div className="flex justify-between py-1.5">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm font-medium text-right max-w-[60%]">{value}</span>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalle de Transacción</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <DetailRow label="Tipo" value={tx.type === "transfer" ? "Transferencia" : tx.type === "deposit" ? "Depósito" : "Retiro"} />
          <DetailRow
            label="Monto"
            value={`$${tx.amount?.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          />
          <div className="flex justify-between py-1.5">
            <span className="text-sm text-muted-foreground">Estado</span>
            <Badge variant={getStatusBadgeVariant(tx.status)}>
              {getStatusLabel(tx.status)}
            </Badge>
          </div>
          <DetailRow
            label="Fecha"
            value={tx.createdAt ? new Date(tx.createdAt).toLocaleDateString("es", { year: "numeric", month: "long", day: "numeric" }) : undefined}
          />

          <Separator />

          <DetailRow
            label="Cuenta origen"
            value={tx.fromAccount ? `${tx.fromAccount.accountNumber} (${tx.fromAccount.ownerName})` : undefined}
          />
          <DetailRow label="Cuenta destino" value={tx.toAccountNumber} />
          <DetailRow label="Beneficiario" value={tx.beneficiaryName} />
          <DetailRow label="BIC/SWIFT" value={tx.swiftCode} />
          <DetailRow label="Banco" value={tx.bankName} />
          <DetailRow
            label="Tipo transferencia"
            value={tx.transferType === "internacional" ? "Internacional" : tx.transferType === "nacional" ? "Nacional" : undefined}
          />
          <DetailRow label="Descripción" value={tx.description} />

          {/* Rejection info */}
          {(isRejected || isInReview) && tx.rejectionReason && (
            <>
              <Separator />
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 space-y-2">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-semibold">Motivo de Denegación</span>
                </div>
                <p className="text-sm">{tx.rejectionReason}</p>
                {tx.rejectionSolution && (
                  <>
                    <span className="text-sm font-semibold">Solución</span>
                    <p className="text-sm">{tx.rejectionSolution}</p>
                  </>
                )}
              </div>
            </>
          )}

          {/* Admin: show uploaded document when in_review */}
          {role === "admin" && isInReview && tx.supportDocumentUrl && (
            <>
              <Separator />
              <div className="rounded-md border border-amber-300/50 bg-amber-50 dark:bg-amber-950/20 p-3 space-y-2">
                <span className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                  Documento de Soporte
                </span>
                <a
                  href={tx.supportDocumentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <Download className="h-4 w-4" />
                  Descargar documento
                </a>
              </div>
            </>
          )}

          {/* Client: upload document when rejected */}
          {role === "client" && isRejected && (
            <>
              <Separator />
              <div className="space-y-3">
                <Label>Adjuntar documento de soporte</Label>
                <div
                  className="flex items-center gap-3 rounded-md border border-dashed p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {selectedFile ? (
                    <>
                      <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                      <span className="text-sm truncate">{selectedFile.name}</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5 text-muted-foreground shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        Haga clic para seleccionar archivo
                      </span>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                />
                <Button
                  className="w-full"
                  disabled={!selectedFile || uploading}
                  onClick={handleSubmitReview}
                >
                  {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enviar a Revisión
                </Button>
              </div>
            </>
          )}

          {/* Client: in-review message */}
          {role === "client" && isInReview && (
            <>
              <Separator />
              <div className="rounded-md border border-amber-300/50 bg-amber-50 dark:bg-amber-950/20 p-3">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Documento enviado, en revisión por el equipo administrativo.
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
