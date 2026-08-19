import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminRootPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/admin/login");
  }

  redirect("/admin/leads");
}
