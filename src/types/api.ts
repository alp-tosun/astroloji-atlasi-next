import { NextResponse } from 'next/server';

export function apiSuccess<T>(result: T) {
  return NextResponse.json({ ok: true, result });
}

export function apiError(error: string, status = 500) {
  return NextResponse.json({ ok: false, error }, { status });
}
