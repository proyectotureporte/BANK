import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAccountsByUser, getTransactionsByAccount } from "@/sanity/queries";
import { createTransaction, updateAccountBalance } from "@/sanity/mutations";
import { transferSchema } from "@/lib/validations";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const accounts = await getAccountsByUser(session.user.id);
    if (!accounts || accounts.length === 0) {
      return NextResponse.json({ transactions: [] });
    }

    const primaryAccount = accounts[0];
    const transactions = await getTransactionsByAccount(primaryAccount._id);

    return NextResponse.json({
      transactions: transactions || [],
      balance: primaryAccount.balance ?? 0,
    });
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = transferSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues?.[0]?.message || "Datos inválidos" },
        { status: 400 }
      );
    }

    const accounts = await getAccountsByUser(session.user.id);
    if (!accounts || accounts.length === 0) {
      return NextResponse.json(
        { error: "No tienes una cuenta activa" },
        { status: 400 }
      );
    }

    const fromAccount = accounts[0];

    if (fromAccount.balance < parsed.data.amount) {
      return NextResponse.json(
        { error: "Saldo insuficiente" },
        { status: 400 }
      );
    }

    const transaction = await createTransaction({
      type: "transfer",
      amount: parsed.data.amount,
      description: parsed.data.description || `Transferencia a ${parsed.data.toAccountNumber}`,
      fromAccount: { _type: "reference", _ref: fromAccount._id },
      toAccountNumber: parsed.data.toAccountNumber,
      status: "pending",
      beneficiaryName: parsed.data.beneficiaryName,
      swiftCode: parsed.data.swiftCode,
      bankName: parsed.data.bankName,
      transferType: parsed.data.transferType,
    });

    // Deduct from sender's balance
    await updateAccountBalance(
      fromAccount._id,
      fromAccount.balance - parsed.data.amount
    );

    return NextResponse.json({ transaction });
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
