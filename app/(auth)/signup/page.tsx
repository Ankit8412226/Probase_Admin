import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { SignupPanel } from "@/app/(auth)/signup/signup-panel";

export default async function SignupPage() {
  const user = await getSessionUser();

  if (user) {
    redirect("/dashboard");
  }

  return <SignupPanel />;
}
