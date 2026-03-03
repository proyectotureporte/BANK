"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
import { Loader2, Eye } from "lucide-react";
import { toast } from "sonner";
import { CreateClientDialog } from "@/components/admin/create-client-dialog";

export default function AdminClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchClients() {
    try {
      const res = await fetch("/api/admin/clients");
      if (res.ok) {
        const data = await res.json();
        setClients(data.clients || []);
      }
    } catch {
      toast.error("Error al cargar clientes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClients();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl md:text-2xl font-bold">Gestión de Clientes</h1>
        <CreateClientDialog onSuccess={fetchClients} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos los Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : clients.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No hay clientes registrados
            </p>
          ) : (
            <>
              {/* Mobile card view */}
              <div className="space-y-3 md:hidden">
                {clients.map((client: any) => (
                  <div
                    key={client._id}
                    className="rounded-lg border p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{client.name}</p>
                      <Badge
                        variant={client.role === "admin" ? "default" : "secondary"}
                        className="capitalize"
                      >
                        {client.role}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{client.email}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {client.accountCount || 0} cuenta(s)
                      </span>
                      <span className="font-semibold">
                        ${(client.totalBalance || 0).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <Link href={`/admin/clients/${client._id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Cliente
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>

              {/* Desktop table view */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Cuentas</TableHead>
                      <TableHead>Balance Total</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client: any) => (
                      <TableRow key={client._id}>
                        <TableCell className="font-medium">
                          {client.name}
                        </TableCell>
                        <TableCell>{client.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              client.role === "admin" ? "default" : "secondary"
                            }
                            className="capitalize"
                          >
                            {client.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{client.accountCount || 0}</TableCell>
                        <TableCell>
                          ${(client.totalBalance || 0).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell>
                          <Link href={`/admin/clients/${client._id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              Ver
                            </Button>
                          </Link>
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
    </div>
  );
}
