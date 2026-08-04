import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

/** Desactiva Draft Mode y vuelve al listado público. */
export async function GET() {
  const draft = await draftMode();
  draft.disable();

  redirect("/blog");
}
