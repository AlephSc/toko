import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req) {
  try {
    const body = await req.json();
    const { items, email } = body;

    if (!items || !items.length || !email) {
      return NextResponse.json({ error: 'Missing cart items or email' }, { status: 400 });
    }

    let total = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.id);
      if (!product) continue;
      total += product.price * item.quantity;
      validatedItems.push({
        product_id: product.id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
      });
    }

    const orderInsert = db.prepare('INSERT INTO orders (customer_email, total, status) VALUES (?, ?, ?)');
    const orderResult = orderInsert.run(email, total, 'pending');
    const orderId = orderResult.lastInsertRowid;

    const itemInsert = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
    for (const valItem of validatedItems) {
      itemInsert.run(orderId, valItem.product_id, valItem.quantity, valItem.price);
    }

    // ponytail: Midtrans/Xendit gateway snapshot creation. Replace mock redirect when keys exist.
    const paymentUrl = `https://app.sandbox.midtrans.com/snap/v2/vtweb/mock-${orderId}`;

    return NextResponse.json({
      success: true,
      orderId,
      total,
      paymentUrl,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
