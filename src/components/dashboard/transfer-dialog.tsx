"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const SWIFT_BANK_MAP: Record<string, string> = {
  CHASUS33: "JPMorgan Chase Bank, N.A.",
  CITIUS33: "Citibank, N.A.",
  BOFAUS3N: "Bank of America, N.A.",
  WFBIUS6S: "Wells Fargo Bank, N.A.",
  GSOCUS33: "Goldman Sachs Bank USA",
  MRMDUS33: "Morgan Stanley Private Bank",
  PNCCUS33: "PNC Bank, N.A.",
  USBKUS44: "U.S. Bank N.A.",
  TRNTUS33: "Truist Financial Corporation",
  TDBANK33: "TD Bank, N.A.",
  FNBOUS44: "First National Bank",
  BARCGB22: "Barclays Bank PLC",
  HSBCGB2L: "HSBC UK Bank PLC",
  NWBKGB2L: "NatWest Group PLC",
  LOYDGB2L: "Lloyds Banking Group",
  SCBLGB2L: "Standard Chartered Bank",
  BNPAFRPP: "BNP Paribas",
  SOGEFRPP: "Societe Generale",
  COBADEFF: "Commerzbank AG",
  DEUTDEFF: "Deutsche Bank AG",
  BBVAESMM: "Banco Bilbao Vizcaya Argentaria",
  BSCHESMM: "Banco Santander, S.A.",
  UNCRITMM: "UniCredit S.p.A.",
  MABORKMM: "Mashreq Bank",
  UBSWCHZH: "UBS Group AG",
  HONAHNT2: "Banco de Honduras",
  BMILHNTE: "Banco de América Central (BAC)",
};

const BLOCKING_STATUSES = ["pending", "rejected", "in_review"];

interface TransferDialogProps {
  onSuccess?: () => void;
  refreshMode?: "router";
  transactions?: any[];
}

export function TransferDialog({ onSuccess, refreshMode, transactions: externalTx }: TransferDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [localTx, setLocalTx] = useState<any[] | null>(null);
  const [form, setForm] = useState({
    toAccountNumber: "",
    beneficiaryName: "",
    swiftCode: "",
    amount: "",
    description: "",
  });

  // Use external transactions if provided, otherwise fetch on open
  const allTransactions = externalTx ?? localTx;

  useEffect(() => {
    if (open && (balance === null || (!externalTx && localTx === null))) {
      fetch("/api/transactions")
        .then((res) => res.json())
        .then((data) => {
          setBalance(data.balance ?? 0);
          if (!externalTx) {
            setLocalTx(data.transactions ?? []);
          }
        })
        .catch(() => {
          setBalance(0);
          if (!externalTx) setLocalTx([]);
        });
    }
  }, [open, balance, externalTx, localTx]);

  const hasBlockingTransfer = allTransactions?.some(
    (t: any) => t.type === "transfer" && BLOCKING_STATUSES.includes(t.status)
  ) ?? false;

  const parsedAmount = parseFloat(form.amount);
  const amountExceedsBalance = balance !== null && !isNaN(parsedAmount) && parsedAmount > balance;

  const swiftLen = form.swiftCode.length;
  const swiftValid = swiftLen === 0 || swiftLen === 8;
  const resolvedBank = swiftLen === 8
    ? SWIFT_BANK_MAP[form.swiftCode.toUpperCase()] || null
    : undefined;

  function resetForm() {
    setForm({
      toAccountNumber: "",
      beneficiaryName: "",
      swiftCode: "",
      amount: "",
      description: "",
    });
    setSuccess(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const swiftUpper = form.swiftCode.trim().toUpperCase();
    const bankName = swiftUpper ? (SWIFT_BANK_MAP[swiftUpper] || swiftUpper) : undefined;
    const transferType = swiftUpper ? "internacional" : "nacional";

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toAccountNumber: form.toAccountNumber,
          amount: parseFloat(form.amount),
          description: form.description || undefined,
          beneficiaryName: form.beneficiaryName,
          swiftCode: swiftUpper || undefined,
          bankName,
          transferType,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al crear transferencia");
      }

      setBalance((prev) => (prev !== null ? prev - parseFloat(form.amount) : prev));
      setSuccess(true);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleAccept() {
    setOpen(false);
    resetForm();
    // Reset local transactions so they re-fetch next time
    setLocalTx(null);
    if (onSuccess) {
      onSuccess();
    } else if (refreshMode === "router") {
      router.refresh();
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (success) return;
        setOpen(value);
        if (!value) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Transferencia
        </Button>
      </DialogTrigger>
      <DialogContent
        onPointerDownOutside={(e) => { if (success) e.preventDefault(); }}
        onEscapeKeyDown={(e) => { if (success) e.preventDefault(); }}
        showCloseButton={!success}
      >
        {success ? (
          <div className="flex flex-col items-center py-6">
            <Card className="w-full border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
              <CardContent className="flex flex-col items-center gap-4 pt-6">
                <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
                <h3 className="text-lg font-semibold text-center">
                  Transferencia Exitosa
                </h3>
                <p className="text-sm text-muted-foreground text-center">
                  Tu transferencia ha sido procesada correctamente y está en estado pendiente.
                </p>
                <Button onClick={handleAccept} className="w-full mt-2">
                  Aceptar
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : hasBlockingTransfer ? (
          <div className="flex flex-col items-center py-6">
            <Card className="w-full border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
              <CardContent className="flex flex-col items-center gap-4 pt-6">
                <AlertTriangle className="h-12 w-12 text-amber-600 dark:text-amber-400" />
                <h3 className="text-lg font-semibold text-center">
                  Transferencia en Proceso
                </h3>
                <p className="text-sm text-muted-foreground text-center">
                  Tiene una transferencia en proceso, debe completarse antes de realizar otra nueva.
                </p>
                <Button
                  onClick={() => { setOpen(false); resetForm(); }}
                  className="w-full mt-2"
                  variant="outline"
                >
                  Entendido
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Nueva Transferencia</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Cuenta destino (Nacional o Internacional)</Label>
                <Input
                  placeholder="Número de cuenta"
                  value={form.toAccountNumber}
                  onChange={(e) =>
                    setForm({ ...form, toAccountNumber: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Nombre del Beneficiario</Label>
                <Input
                  placeholder="Nombre completo del beneficiario"
                  value={form.beneficiaryName}
                  onChange={(e) =>
                    setForm({ ...form, beneficiaryName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>BIC/SWIFT (opcional, 8 caracteres)</Label>
                <Input
                  placeholder="Ej: CHASUS33"
                  value={form.swiftCode}
                  maxLength={8}
                  onChange={(e) =>
                    setForm({ ...form, swiftCode: e.target.value.toUpperCase().slice(0, 8) })
                  }
                />
                {swiftLen > 0 && swiftLen < 8 && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    El código SWIFT debe tener exactamente 8 caracteres ({swiftLen}/8)
                  </p>
                )}
                {swiftLen === 8 && (
                  <p
                    className={`text-xs ${
                      resolvedBank
                        ? "text-green-600 dark:text-green-400"
                        : "text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {resolvedBank || "Código no reconocido"}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Monto ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) =>
                    setForm({ ...form, amount: e.target.value })
                  }
                  required
                />
                {amountExceedsBalance && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    Monto mayor al disponible (Balance: ${balance?.toLocaleString("en-US", { minimumFractionDigits: 2 })})
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Descripción (opcional)</Label>
                <Input
                  placeholder="Motivo de la transferencia"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting || !swiftValid || amountExceedsBalance}>
                {submitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Enviar Transferencia
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
