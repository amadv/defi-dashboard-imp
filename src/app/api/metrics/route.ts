import { NextResponse } from 'next/server';
import { getMetrics, getTVLByProtocol, getVolumeByChain } from '@/lib/db';

export async function GET() {
  try {
    const metrics = getMetrics();
    const tvlByProtocol = getTVLByProtocol();
    const volumeByChain = getVolumeByChain();

    return NextResponse.json({
      metrics,
      tvlByProtocol,
      volumeByChain
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}
