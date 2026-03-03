import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUserByResetToken } from "@/sanity/queries";
import { updateUser } from "@/sanity/mutations";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, password } = body;

    if (!token || !password || password.length < 6) {
      return NextResponse.json(
        { error: "Datos inválidos" },
        { status: 400 }
      );
    }

    const user = await getUserByResetToken(token);

    if (!user) {
      return NextResponse.json(
        { error: "Token inválido o expirado" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await updateUser(user._id, {
      password: hashedPassword,
      resetToken: "",
      resetTokenExpiry: "",
    });

    return NextResponse.json({ message: "Contraseña actualizada" });
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
