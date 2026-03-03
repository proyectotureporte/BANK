import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateAccountBalance } from "@/sanity/mutations";
import { updateBalanceSchema } from "@/lib/validations";

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateBalanceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues?.[0]?.message || "Datos inválidos" },
        { status: 400 }
      );
    }

    await updateAccountBalance(parsed.data.accountId, parsed.data.newBalance);

    return NextResponse.json({ message: "Balance actualizado" });
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
