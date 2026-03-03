import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAccountsByUser, getTransactionsByAccount } from "@/sanity/queries";
import { sanityWriteClient } from "@/sanity/client";
import { submitForReview } from "@/sanity/mutations";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const formData = await req.formData();
    const transactionId = formData.get("transactionId") as string;
    const file = formData.get("file") as File | null;

    if (!transactionId || !file) {
      return NextResponse.json(
        { error: "Transacción y documento son requeridos" },
        { status: 400 }
      );
    }

    // Verify transaction belongs to user's account and is rejected
    const accounts = await getAccountsByUser(session.user.id);
    if (!accounts || accounts.length === 0) {
      return NextResponse.json(
        { error: "No tienes una cuenta activa" },
        { status: 400 }
      );
    }

    const primaryAccount = accounts[0];
    const transactions = await getTransactionsByAccount(primaryAccount._id);
    const tx = transactions?.find((t: any) => t._id === transactionId);

    if (!tx) {
      return NextResponse.json(
        { error: "Transacción no encontrada" },
        { status: 404 }
      );
    }

    if (tx.status !== "rejected") {
      return NextResponse.json(
        { error: "Solo se pueden enviar documentos para transacciones denegadas" },
        { status: 400 }
      );
    }

    // Upload file to Sanity
    const buffer = Buffer.from(await file.arrayBuffer());
    const asset = await sanityWriteClient.assets.upload("file", buffer, {
      filename: file.name,
      contentType: file.type,
    });

    // Update transaction
    await submitForReview(transactionId, asset._id);

    return NextResponse.json({ message: "Documento enviado a revisión" });
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
