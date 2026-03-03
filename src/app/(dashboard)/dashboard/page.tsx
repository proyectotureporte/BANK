import { auth } from "@/lib/auth";
import { getAccountsByUser } from "@/sanity/queries";
import { getTransactionsByAccount } from "@/sanity/queries";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, ArrowUpRight, Clock } from "lucide-react";
import { TransferDialog } from "@/components/dashboard/transfer-dialog";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const accounts = await getAccountsByUser(session.user.id);
  const primaryAccount = accounts?.[0];

  let allTransactions: any[] = [];
  if (primaryAccount) {
    allTransactions = (await getTransactionsByAccount(primaryAccount._id)) || [];
  }
  const recentTransactions = allTransactions.slice(0, 5);

  const totalBalance = accounts?.reduce(
    (sum: number, acc: any) => sum + (acc.balance || 0),
    0
  ) || 0;

  const pendingCount = recentTransactions.filter(
    (t: any) => t.status === "pending"
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Resumen de Cuenta</h1>
        <TransferDialog refreshMode="router" transactions={allTransactions} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Balance Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {accounts?.length || 0} cuenta(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Cuenta Principal
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {primaryAccount?.accountNumber || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {primaryAccount?.currency || "USD"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Pendientes
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              transacciones por aprobar
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transacciones Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentTransactions transactions={recentTransactions} />
        </CardContent>
      </Card>
    </div>
  );
}
