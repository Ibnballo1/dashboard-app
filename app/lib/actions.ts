"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import postgres from "postgres";
import { redirect } from "next/navigation";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

// Define the schema for the form data
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(["pending", "paid"]),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });
// The Server Action to be called when form is submitted
export async function createInvoice(formData: FormData) {
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });
  const amountInCent = amount * 100; // convert the amount to cent to avoid js floating-points error
  const date = new Date().toISOString().split("T")[0]; // get the current date in YYYY-MM-DD format

  try {
    await sql`
    INSERT INTO invoices (customer_Id, amount, status, date)
    VALUES (${customerId}, ${amountInCent}, ${status}, ${date})
  `;
  } catch (error) {
    console.error("Error creating invoice:", error);
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  const amountInCent = amount * 100;

  try {
    await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCent}, status = ${status}
    WHERE id = ${id}
  `;
  } catch (error) {
    console.error("Error updating invoice:", error);
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string) {
  // throw new Error("Unable to delete invoice");
  await sql`
    DELETE FROM invoices WHERE id = ${id}
  `;
  revalidatePath("/dashboard/invoices");
}
