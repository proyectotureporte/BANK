const account = {
  name: "account",
  title: "Account",
  type: "document",
  fields: [
    {
      name: "accountNumber",
      title: "Account Number",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "owner",
      title: "Owner",
      type: "reference",
      to: [{ type: "user" }],
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "balance",
      title: "Balance",
      type: "number",
      initialValue: 0,
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "currency",
      title: "Currency",
      type: "string",
      initialValue: "USD",
    },
    {
      name: "createdAt",
      title: "Created At",
      type: "datetime",
    },
  ],
};

export default account;
