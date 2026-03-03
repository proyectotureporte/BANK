import { sanityWriteClient } from "./client";

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role?: string;
  mustChangePassword?: boolean;
}) {
  return sanityWriteClient.create({
    _type: "user",
    ...data,
    role: data.role || "client",
    mustChangePassword: data.mustChangePassword ?? false,
  });
}

export async function updateUser(
  id: string,
  data: Record<string, unknown>
) {
  return sanityWriteClient.patch(id).set(data).commit();
}

export async function createAccount(data: {
  accountNumber: string;
  owner: { _type: "reference"; _ref: string };
  balance?: number;
  currency?: string;
}) {
  return sanityWriteClient.create({
    _type: "account",
    balance: 0,
    currency: "USD",
    createdAt: new Date().toISOString(),
    ...data,
  });
}

export async function updateAccountBalance(
  id: string,
  newBalance: number
) {
  return sanityWriteClient.patch(id).set({ balance: newBalance }).commit();
}

export async function createTransaction(data: {
  type: string;
  amount: number;
  description?: string;
  fromAccount?: { _type: "reference"; _ref: string };
  toAccount?: { _type: "reference"; _ref: string };
  toAccountNumber?: string;
  status?: string;
  beneficiaryName?: string;
  swiftCode?: string;
  bankName?: string;
  transferType?: string;
}) {
  return sanityWriteClient.create({
    _type: "transaction",
    status: "pending",
    createdAt: new Date().toISOString(),
    ...data,
  });
}

export async function updateTransactionStatus(
  id: string,
  status: string,
  approvedBy?: string
) {
  const data: Record<string, unknown> = { status };
  if (approvedBy) {
    data.approvedBy = { _type: "reference", _ref: approvedBy };
  }
  return sanityWriteClient.patch(id).set(data).commit();
}

export async function rejectTransaction(
  id: string,
  reason: string,
  solution: string,
  rejectedBy: string
) {
  return sanityWriteClient
    .patch(id)
    .set({
      status: "rejected",
      rejectionReason: reason,
      rejectionSolution: solution,
      approvedBy: { _type: "reference", _ref: rejectedBy },
    })
    .commit();
}

export async function submitForReview(id: string, documentAssetId: string) {
  return sanityWriteClient
    .patch(id)
    .set({
      status: "in_review",
      supportDocument: {
        _type: "file",
        asset: { _type: "reference", _ref: documentAssetId },
      },
    })
    .commit();
}
