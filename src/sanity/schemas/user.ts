const user = {
  name: "user",
  title: "User",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "email",
      title: "Email",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "password",
      title: "Password",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "role",
      title: "Role",
      type: "string",
      options: {
        list: [
          { title: "Client", value: "client" },
          { title: "Admin", value: "admin" },
        ],
      },
      initialValue: "client",
    },
    {
      name: "mustChangePassword",
      title: "Must Change Password",
      type: "boolean",
      initialValue: false,
    },
    {
      name: "resetToken",
      title: "Reset Token",
      type: "string",
    },
    {
      name: "resetTokenExpiry",
      title: "Reset Token Expiry",
      type: "datetime",
    },
  ],
};

export default user;
