import { requireAdmin } from "@/lib/admin/auth";
import { redirect } from "next/navigation";

export default async function AdminRootPage() {
  await requireAdmin();

  redirect("/admin/leads");
}
