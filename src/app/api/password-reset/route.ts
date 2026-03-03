import { NextResponse } from "next/server";
import crypto from "crypto";
import { getUserByEmail } from "@/sanity/queries";
import { updateUser } from "@/sanity/mutations";
import { sendPasswordResetEmail } from "@/lib/resend";
import { forgotPasswordSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    const user = await getUserByEmail(parsed.data.email);

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ message: "Si el email existe, recibirás un enlace" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(
      Date.now() + 60 * 60 * 1000
    ).toISOString();

    await updateUser(user._id, { resetToken, resetTokenExpiry });
    await sendPasswordResetEmail(parsed.data.email, resetToken);

    return NextResponse.json({ message: "Si el email existe, recibirás un enlace" });
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
