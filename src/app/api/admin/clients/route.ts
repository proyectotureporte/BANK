import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAllUsers, getUserById, getAccountsByUser, getUserByEmail } from "@/sanity/queries";
import { createUser, createAccount } from "@/sanity/mutations";
import bcrypt from "bcryptjs";

const DEFAULT_PASSWORD = "Cliente1234*";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const id = req.nextUrl.searchParams.get("id");

    if (id) {
      const client = await getUserById(id);
      if (!client) {
        return NextResponse.json(
          { error: "Cliente no encontrado" },
          { status: 404 }
        );
      }
      const accounts = await getAccountsByUser(id);
      return NextResponse.json({ client, accounts: accounts || [] });
    }

    const users = await getAllUsers();
    const clients = await Promise.all(
      (users || []).map(async (user: any) => {
        const accounts = await getAccountsByUser(user._id);
        const totalBalance = (accounts || []).reduce(
          (sum: number, acc: any) => sum + (acc.balance || 0),
          0
        );
        return {
          ...user,
          accountCount: accounts?.length || 0,
          totalBalance,
        };
      })
    );

    return NextResponse.json({ clients });
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
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, accountNumber, balance, currency } = body;

    if (!name || !email || !accountNumber) {
      return NextResponse.json(
        { error: "Nombre, email y número de cuenta son requeridos" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe un usuario con este email" },
        { status: 400 }
      );
    }

    // Hash default password
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    // Create user
    const user = await createUser({
      name,
      email,
      password: hashedPassword,
      role: "client",
      mustChangePassword: true,
    });

    // Create account
    await createAccount({
      accountNumber,
      owner: { _type: "reference", _ref: user._id },
      balance: parseFloat(balance) || 0,
      currency: currency || "USD",
    });

    return NextResponse.json({ message: "Cliente creado exitosamente" });
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
