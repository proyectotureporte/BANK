"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, User, Mail, CreditCard, Save } from "lucide-react";
import { toast } from "sonner";

export default function ClientDetailPage() {
  const params = useParams();
  const clientId = params.id as string;
  const [client, setClient] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [balanceEdits, setBalanceEdits] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  async function fetchClient() {
    try {
      const res = await fetch(`/api/admin/clients?id=${clientId}`);
      if (res.ok) {
        const data = await res.json();
        setClient(data.client);
        setAccounts(data.accounts || []);
      }
    } catch {
      toast.error("Error al cargar cliente");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClient();
  }, [clientId]);

  async function handleUpdateBalance(accountId: string) {
    const newBalance = parseFloat(balanceEdits[accountId]);
    if (isNaN(newBalance) || newBalance < 0) {
      toast.error("Balance inválido");
      return;
    }

    setSaving(accountId);
    try {
      const res = await fetch("/api/admin/accounts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, newBalance }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al actualizar");
      }

      toast.success("Balance actualizado");
      setBalanceEdits((prev) => {
        const next = { ...prev };
        delete next[accountId];
        return next;
      });
      fetchClient();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(null);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!client) {
    return (
      <p className="text-center text-muted-foreground py-12">
        Cliente no encontrado
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Detalle de Cliente</h1>

      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Nombre</p>
              <p className="font-medium">{client.name}</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{client.email}</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Rol</p>
              <Badge variant="secondary" className="capitalize">
                {client.role}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cuentas</CardTitle>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Sin cuentas
            </p>
          ) : (
            <div className="space-y-4">
              {accounts.map((acc: any) => (
                <div
                  key={acc._id}
                  className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{acc.accountNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        Balance actual: $
                        {acc.balance?.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="sr-only">Nuevo balance</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Nuevo balance"
                      className="w-40"
                      value={balanceEdits[acc._id] ?? ""}
                      onChange={(e) =>
                        setBalanceEdits((prev) => ({
                          ...prev,
                          [acc._id]: e.target.value,
                        }))
                      }
                    />
                    <Button
                      size="sm"
                      disabled={
                        saving === acc._id || !balanceEdits[acc._id]
                      }
                      onClick={() => handleUpdateBalance(acc._id)}
                    >
                      {saving === acc._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
