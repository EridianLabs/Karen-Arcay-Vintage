import Link from "next/link";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">Thank you for your order</h1>
      <p className="mt-4 text-zinc-600">
        Payment was successful. We&apos;ll send a confirmation to your email.
      </p>
      <Link
        href="/shop"
        className="mt-8 inline-block rounded bg-black px-6 py-2 text-white hover:bg-zinc-800"
      >
        Continue shopping
      </Link>
    </div>
  );
}
