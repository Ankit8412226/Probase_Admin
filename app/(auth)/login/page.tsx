import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth";
import { LoginPanel } from "@/app/(auth)/login/login-panel";

export default async function LoginPage() {
  const user = await getSessionUser();

  if (user) {
    redirect("/dashboard");
  }

  return <LoginPanel />;
}
