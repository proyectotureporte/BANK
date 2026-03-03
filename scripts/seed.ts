/**
 * Seed script for Ocean Bank
 *
 * Run with: npx tsx scripts/seed.ts
 *
 * Creates:
 * - Admin user (admin@oceanbank.com / admin123)
 * - Demo client (cliente@oceanbank.com / cliente123)
 * - Account for demo client with $5,000 balance
 */

import { config } from "dotenv";
import { createClient } from "@sanity/client";
import bcrypt from "bcryptjs";

config({ path: ".env.local" });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN || "",
});

async function seed() {
  console.log("Seeding Ocean Bank database...\n");

  // Hash passwords
  const adminPass = await bcrypt.hash("admin123", 12);
  const clientPass = await bcrypt.hash("cliente123", 12);

  // Create admin user
  const admin = await client.createOrReplace({
    _id: "user-admin",
    _type: "user",
    name: "Administrador Ocean Bank",
    email: "admin@oceanbank.com",
    password: adminPass,
    role: "admin",
  });
  console.log("Admin created:", admin.email);

  // Create demo client
  const demoClient = await client.createOrReplace({
    _id: "user-demo-client",
    _type: "user",
    name: "Juan Pérez",
    email: "cliente@oceanbank.com",
    password: clientPass,
    role: "client",
  });
  console.log("Client created:", demoClient.email);

  // Create account for demo client
  const account = await client.createOrReplace({
    _id: "account-demo",
    _type: "account",
    accountNumber: "OCN-001-0001",
    owner: { _type: "reference", _ref: "user-demo-client" },
    balance: 5000,
    currency: "USD",
    createdAt: new Date().toISOString(),
  });
  console.log("Account created:", account.accountNumber, "Balance: $5,000\n");

  console.log("=== Seed complete! ===");
  console.log("Admin login:  admin@oceanbank.com / admin123");
  console.log("Client login: cliente@oceanbank.com / cliente123");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
