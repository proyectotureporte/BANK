import { auth } from "@/lib/auth";
import { getUserById } from "@/sanity/queries";
import { getAccountsByUser } from "@/sanity/queries";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Shield, CreditCard } from "lucide-react";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await getUserById(session.user.id);
  const accounts = await getAccountsByUser(session.user.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mi Perfil</h1>

      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Nombre</p>
              <p className="font-medium">{user?.name || "-"}</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user?.email || "-"}</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Rol</p>
              <Badge variant="secondary" className="capitalize">
                {user?.role || "client"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mis Cuentas</CardTitle>
        </CardHeader>
        <CardContent>
          {!accounts || accounts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No tienes cuentas registradas
            </p>
          ) : (
            <div className="space-y-3">
              {accounts.map((acc: any) => (
                <div
                  key={acc._id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{acc.accountNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {acc.currency}
                      </p>
                    </div>
                  </div>
                  <p className="text-lg font-bold">
                    ${acc.balance?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
