import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const products = db.prepare('SELECT * FROM products').all();
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
