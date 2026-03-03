import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAllTransactions, getAccountById } from "@/sanity/queries";
import {
  updateTransactionStatus,
  updateAccountBalance,
  rejectTransaction,
} from "@/sanity/mutations";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const transactions = await getAllTransactions();
    return NextResponse.json({ transactions: transactions || [] });
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await req.json();
    const { transactionId, status, rejectionReason, rejectionSolution } = body;

    if (!transactionId || !["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Datos inválidos" },
        { status: 400 }
      );
    }

    if (status === "rejected") {
      if (!rejectionReason || !rejectionSolution) {
        return NextResponse.json(
          { error: "Motivo y solución son requeridos para rechazar" },
          { status: 400 }
        );
      }
      await rejectTransaction(
        transactionId,
        rejectionReason,
        rejectionSolution,
        session.user.id
      );
      return NextResponse.json({ message: "Transacción denegada" });
    }

    // Approve flow
    const allTx = await getAllTransactions();
    const tx = allTx?.find((t: any) => t._id === transactionId);

    if (tx && tx.type === "transfer") {
      if (tx.fromAccount && tx.toAccount) {
        // Internal transfer: credit destination
        const toAccount = await getAccountById(tx.toAccount._id);
        if (toAccount) {
          await updateAccountBalance(
            toAccount._id,
            toAccount.balance + tx.amount
          );
        }
      }
      // External transfer (no toAccount ref): balance already deducted at creation, nothing else to do
    }

    await updateTransactionStatus(transactionId, status, session.user.id);

    return NextResponse.json({ message: "Transacción aprobada" });
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
