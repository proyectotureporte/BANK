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

// Wallets conocidas → etiqueta
const KNOWN_WALLETS: Record<string, string> = {
  bc1qhjg95pl6jj3z9vxdeg5dtjqsgg2j269uga0we6: "Blue Wallet",
};

// Detecta red según prefijo de wallet
function detectNetwork(wallet: string): string {
  const w = wallet.trim().toLowerCase();
  if (w.startsWith("bc1") || w.startsWith("1") || w.startsWith("3")) {
    return "Bitcoin";
  }
  if (w.startsWith("0x")) return "Ethereum";
  if (w.startsWith("t") || w.startsWith("ltc1")) return "Litecoin";
  return "";
}

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
    walletAddress: "",
    amount: "",
    description: "",
  });

  const allTransactions = externalTx ?? localTx;

  useEffect(() => {
    if (open && (balance === null || (!externalTx && localTx === null))) {
      fetch("/api/transactions")
        .then((res) => res.json())
        .then((data) => {
          setBalance(data.balance ?? 0);
          if (!externalTx) setLocalTx(data.transactions ?? []);
        })
        .catch(() => {
          setBalance(0);
          if (!externalTx) setLocalTx([]);
        });
    }
  }, [open, balance, externalTx, localTx]);

  const hasBlockingTransfer =
    allTransactions?.some(
      (t: any) => t.type === "transfer" && BLOCKING_STATUSES.includes(t.status)
    ) ?? false;

  const parsedAmount = parseFloat(form.amount);
  const amountExceedsBalance =
    balance !== null && !isNaN(parsedAmount) && parsedAmount > balance;

  // Wallet label y red
  const walletTrimmed = form.walletAddress.trim();
  const walletLabel = walletTrimmed ? KNOWN_WALLETS[walletTrimmed] ?? null : null;
  const detectedNetwork = walletTrimmed ? detectNetwork(walletTrimmed) : "";

  function resetForm() {
    setForm({ walletAddress: "", amount: "", description: "" });
    setSuccess(false);
  }

  function handleMaxAmount() {
    if (balance !== null) {
      setForm((prev) => ({ ...prev, amount: balance.toString() }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toAccountNumber: form.walletAddress,
          amount: parseFloat(form.amount),
          description: form.description || undefined,
          beneficiaryName: walletLabel ?? form.walletAddress,
          network: detectedNetwork || "Bitcoin",
          transferType: "crypto",
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

              {/* Wallet BTC */}
              <div className="space-y-2">
                <Label>Wallet (BTC)</Label>
                <Input
                  placeholder="Dirección de wallet Bitcoin"
                  value={form.walletAddress}
                  onChange={(e) =>
                    setForm({ ...form, walletAddress: e.target.value.trim() })
                  }
                  required
                />
                {walletLabel && (
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                    {walletLabel}
                  </p>
                )}
              </div>

              {/* Red (read-only, auto-fill) */}
              <div className="space-y-2">
                <Label>Red</Label>
                <Input
                  value={detectedNetwork}
                  readOnly
                  placeholder="Se detecta automáticamente"
                  className="bg-muted text-muted-foreground cursor-not-allowed"
                />
              </div>

              {/* Monto con botón Max */}
              <div className="space-y-2">
                <Label>Monto ($)</Label>
                <div className="flex gap-2">
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
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleMaxAmount}
                    disabled={balance === null}
                    className="shrink-0"
                  >
                    Max
                  </Button>
                </div>
                {amountExceedsBalance && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    Monto mayor al disponible (Balance: ${balance?.toLocaleString("en-US", { minimumFractionDigits: 2 })})
                  </p>
                )}
              </div>

              {/* Descripción */}
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

              <Button
                type="submit"
                className="w-full"
                disabled={submitting || amountExceedsBalance || !form.walletAddress}
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar Transferencia
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
