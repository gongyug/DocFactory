import { NextResponse } from 'next/server';
import { HealthCheckResponse } from '@/types/api';

export const runtime = 'nodejs';

export async function GET() {
  const response: HealthCheckResponse = {
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response, { status: 200 });
}