import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db";

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, email } = body as {
      items: Array<{ productId: string; quantity: number }>;
      email: string;
    };
    if (!items?.length || !email) {
      return NextResponse.json(
        { error: "Items and email required" },
        { status: 400 }
      );
    }

    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    let totalCents = 0;

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) continue;
      const priceCents = Math.round(
        (product.salePrice ?? product.price) * 100 * item.quantity
      );
      totalCents += priceCents;
      lineItems.push({
        price_data: {
          currency: "gbp",
          product_data: {
            name: product.title,
            description: product.description.slice(0, 500),
            images: (JSON.parse(product.images || "[]") as string[]).slice(0, 1).map(
              (url) => (url.startsWith("http") ? url : `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}${url}`)
            ),
          },
          unit_amount: Math.round((product.salePrice ?? product.price) * 100),
        },
        quantity: item.quantity,
      });
    }

    if (lineItems.length === 0) {
      return NextResponse.json({ error: "No valid items" }, { status: 400 });
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { error: "Checkout is not configured. Use Buy on eBay for this item." },
        { status: 503 }
      );
    }
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: lineItems,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/cart`,
      metadata: {
        email,
        totalCents: String(totalCents),
        productIds: productIds.join(","),
        quantities: items.map((i) => i.quantity).join(","),
      },
    });

    await prisma.order.create({
      data: {
        stripeSessionId: session.id,
        email,
        totalCents,
        status: "pending",
        items: {
          create: items.map((item) => {
            const product = productMap.get(item.productId)!;
            const priceCents = Math.round(
              (product.salePrice ?? product.price) * 100 * item.quantity
            );
            return {
              productId: item.productId,
              quantity: item.quantity,
              priceCents,
            };
          }),
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("Checkout error:", e);
    return NextResponse.json(
      { error: "Checkout failed" },
      { status: 500 }
    );
  }
}
