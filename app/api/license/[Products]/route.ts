  // app/api/license/[Products]/route.ts
  import { NextResponse, NextRequest } from 'next/server';

  export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ Products: string }> }
  ) {
    const product = (await params).Products;
    let licenseKey: string;

    switch (product) {
      case 'wijmo':
        licenseKey =
          process.env.WIJMO_LICENSE_KEY ?? 'default-wijmo-license-key';
        break;
      case 'activereportsjs':
        licenseKey =
          process.env.ACTIVEREPORTSJS_LICENSE_KEY ??
          'default-activereportsjs-license-key';
        break;
      default:
        licenseKey = 'default-license-key';
    }

    return NextResponse.json({ licenseKey });
  }