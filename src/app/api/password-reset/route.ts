import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "@/sanity/queries";
import { updateUser } from "@/sanity/mutations";
import { forgotPasswordSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Datos inválidos" },
        { status: 400 }
      );
    }

    const user = await getUserByEmail(parsed.data.email);

    if (!user) {
      return NextResponse.json(
        { error: "No se encontró una cuenta con ese email" },
        { status: 404 }
      );
    }

    const hashedPassword = await bcrypt.hash(parsed.data.password, 12);

    await updateUser(user._id, {
      password: hashedPassword,
      resetToken: "",
      resetTokenExpiry: "",
    });

    return NextResponse.json({ message: "Contraseña restablecida exitosamente" });
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
