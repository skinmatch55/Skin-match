import { redirect } from "next/navigation";
import { ConfirmReturn } from "@/components/app/confirm-return";

/** Buyers coming back from the fallback checkout page land here: confirm, play the unlock moment. */
export default async function Dashboard({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  if (sp.paid === "1" && sp.ref && /^[\w.-]{4,200}$/.test(sp.ref)) return <ConfirmReturn refId={sp.ref} />;
  redirect("/routine");
}
