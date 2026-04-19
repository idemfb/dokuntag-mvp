import { redirect } from "next/navigation";

export default async function RecoverVerifyPage({
  searchParams
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const token =
    typeof resolvedSearchParams?.token === "string"
      ? resolvedSearchParams.token.trim()
      : "";

  if (!token) {
    redirect("/my");
  }

  redirect(`/my/list?token=${encodeURIComponent(token)}`);
}