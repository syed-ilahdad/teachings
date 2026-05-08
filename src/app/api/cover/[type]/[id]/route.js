import { NextResponse } from 'next/server';
import { executeD1Query } from '@/lib/db';
import { getSignedDownloadUrl } from '@/lib/r2';

export async function GET(request, context) {
  try {
    // Next.js dynamic params are async
    const { type, id } = await context.params;

    let coverKey = null;

    if (type === 'file') {
      const result = await executeD1Query(
        'SELECT cover_key FROM files WHERE id = ?',
        [id]
      );

      coverKey = result.results?.[0]?.cover_key;

    } else if (type === 'category') {
      const result = await executeD1Query(
        'SELECT cover_key FROM categories WHERE id = ?',
        [id]
      );

      coverKey = result.results?.[0]?.cover_key;
    }

    if (!coverKey) {
      return new NextResponse(
        'No cover found',
        { status: 404 }
      );
    }

    const signedUrl = await getSignedDownloadUrl(
      coverKey,
      3600
    );

    // Browser gets actual image
    return NextResponse.redirect(
      signedUrl
    );

  } catch (err) {
    console.error(
      'Cover API error:',
      err
    );

    return new NextResponse(
      err.message,
      { status: 500 }
    );
  }
}