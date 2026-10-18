import { redirect } from "next/navigation";

/** Alias route for “check” intent — tool lives on home `#scan`. */
export default function CheckPage() {
  redirect("/#scan");
}
