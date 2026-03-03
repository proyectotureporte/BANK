const transaction = {
  name: "transaction",
  title: "Transaction",
  type: "document",
  fields: [
    {
      name: "type",
      title: "Type",
      type: "string",
      options: {
        list: [
          { title: "Deposit", value: "deposit" },
          { title: "Withdrawal", value: "withdrawal" },
          { title: "Transfer", value: "transfer" },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "amount",
      title: "Amount",
      type: "number",
      validation: (Rule: any) => Rule.required().positive(),
    },
    {
      name: "description",
      title: "Description",
      type: "string",
    },
    {
      name: "beneficiaryName",
      title: "Beneficiary Name",
      type: "string",
    },
    {
      name: "swiftCode",
      title: "SWIFT/BIC Code",
      type: "string",
    },
    {
      name: "bankName",
      title: "Bank Name",
      type: "string",
    },
    {
      name: "transferType",
      title: "Transfer Type",
      type: "string",
      options: {
        list: [
          { title: "Nacional", value: "nacional" },
          { title: "Internacional", value: "internacional" },
        ],
      },
    },
    {
      name: "fromAccount",
      title: "From Account",
      type: "reference",
      to: [{ type: "account" }],
    },
    {
      name: "toAccount",
      title: "To Account (Internal)",
      type: "reference",
      to: [{ type: "account" }],
    },
    {
      name: "toAccountNumber",
      title: "To Account Number (External)",
      type: "string",
    },
    {
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Approved", value: "approved" },
          { title: "Rejected", value: "rejected" },
          { title: "In Review", value: "in_review" },
        ],
      },
      initialValue: "pending",
    },
    {
      name: "rejectionReason",
      title: "Rejection Reason",
      type: "string",
    },
    {
      name: "rejectionSolution",
      title: "Rejection Solution",
      type: "string",
    },
    {
      name: "supportDocument",
      title: "Support Document",
      type: "file",
    },
    {
      name: "createdAt",
      title: "Created At",
      type: "datetime",
    },
    {
      name: "approvedBy",
      title: "Approved By",
      type: "reference",
      to: [{ type: "user" }],
    },
  ],
};

export default transaction;
