import { sanityClient } from "./client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SanityResult = any;

export async function getUserByEmail(email: string): Promise<SanityResult> {
  return sanityClient.fetch(
    `*[_type == "user" && email == $email][0]{
      _id, name, email, password, role, mustChangePassword,
      resetToken, resetTokenExpiry
    }`,
    { email } as any
  );
}

export async function getUserById(id: string): Promise<SanityResult> {
  return sanityClient.fetch(
    `*[_type == "user" && _id == $id][0]`,
    { id } as any
  );
}

export async function getAccountsByUser(userId: string): Promise<SanityResult> {
  return sanityClient.fetch(
    `*[_type == "account" && owner._ref == $userId]{
      _id, accountNumber, balance, currency, createdAt,
      "ownerName": owner->name
    }`,
    { userId } as any
  );
}

export async function getAccountById(id: string): Promise<SanityResult> {
  return sanityClient.fetch(
    `*[_type == "account" && _id == $id][0]{
      _id, accountNumber, balance, currency, createdAt,
      "owner": owner->{_id, name, email}
    }`,
    { id } as any
  );
}

export async function getAccountByNumber(accountNumber: string): Promise<SanityResult> {
  return sanityClient.fetch(
    `*[_type == "account" && accountNumber == $accountNumber][0]{
      _id, accountNumber, balance, currency,
      "owner": owner->{_id, name, email}
    }`,
    { accountNumber } as any
  );
}

export async function getTransactionsByAccount(accountId: string): Promise<SanityResult> {
  return sanityClient.fetch(
    `*[_type == "transaction" && (fromAccount._ref == $accountId || toAccount._ref == $accountId)] | order(createdAt desc) {
      _id, type, amount, description, status, createdAt,
      beneficiaryName, swiftCode, bankName, transferType, toAccountNumber,
      rejectionReason, rejectionSolution,
      "supportDocumentUrl": supportDocument.asset->url,
      "fromAccount": fromAccount->{_id, accountNumber, "ownerName": owner->name},
      "toAccount": toAccount->{_id, accountNumber, "ownerName": owner->name},
      "approvedBy": approvedBy->{_id, name}
    }`,
    { accountId } as any
  );
}

export async function getAllUsers(): Promise<SanityResult> {
  return sanityClient.fetch(
    `*[_type == "user"] | order(name asc) {
      _id, name, email, role
    }`
  );
}

export async function getAllAccounts(): Promise<SanityResult> {
  return sanityClient.fetch(
    `*[_type == "account"] | order(createdAt desc) {
      _id, accountNumber, balance, currency, createdAt,
      "owner": owner->{_id, name, email}
    }`
  );
}

export async function getAllTransactions(): Promise<SanityResult> {
  return sanityClient.fetch(
    `*[_type == "transaction"] | order(createdAt desc) {
      _id, type, amount, description, status, createdAt,
      beneficiaryName, swiftCode, bankName, transferType, toAccountNumber,
      rejectionReason, rejectionSolution,
      "supportDocumentUrl": supportDocument.asset->url,
      "fromAccount": fromAccount->{_id, accountNumber, "ownerName": owner->name},
      "toAccount": toAccount->{_id, accountNumber, "ownerName": owner->name},
      "approvedBy": approvedBy->{_id, name}
    }`
  );
}

export async function getUserByResetToken(token: string): Promise<SanityResult> {
  return sanityClient.fetch(
    `*[_type == "user" && resetToken == $token && resetTokenExpiry > now()][0]`,
    { token } as any
  );
}
