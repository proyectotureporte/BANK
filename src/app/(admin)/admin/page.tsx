import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllUsers, getAllAccounts, getAllTransactions } from "@/sanity/queries";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, CreditCard, ArrowLeftRight, Clock } from "lucide-react";

export default async function AdminOverviewPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/login");

  const [users, accounts, transactions] = await Promise.all([
    getAllUsers(),
    getAllAccounts(),
    getAllTransactions(),
  ]);

  const clientCount = users?.filter((u: any) => u.role === "client").length || 0;
  const totalBalance = accounts?.reduce(
    (sum: number, acc: any) => sum + (acc.balance || 0),
    0
  ) || 0;
  const pendingTx = transactions?.filter(
    (t: any) => t.status === "pending"
  ).length || 0;
  const totalTx = transactions?.length || 0;

  return (
    <div className="space-y-6">
      <h1 className="text-xl md:text-2xl font-bold">Panel de Administración</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientCount}</div>
            <p className="text-xs text-muted-foreground">usuarios registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cuentas</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accounts?.length || 0}</div>
            <p className="text-xs text-muted-foreground">cuentas activas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Balance Total</CardTitle>
            <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">en el sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTx}</div>
            <p className="text-xs text-muted-foreground">
              de {totalTx} transacciones
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
