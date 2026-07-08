import { NextResponse } from 'next/server'
import { getProviderConfig } from '@/app/lib/provider'

export async function GET() {
  const { hasServerKey, providerName, usingCustomEndpoint } =
    getProviderConfig()

  return NextResponse.json({
    hasServerKey,
    providerName,
    usingCustomEndpoint,
  })
}
