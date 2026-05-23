import { revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { parseBody } from 'next-sanity/webhook';

type WebhookBody = {
  _type: string;
  brokerUuid?: string;
};

export async function POST(req: NextRequest) {
  try {
    const { body, isValidSignature } = await parseBody<WebhookBody>(
      req,
      process.env.SANITY_REVALIDATE_SECRET
    );

    if (!isValidSignature) {
      return NextResponse.json(
        { message: 'Invalid signature' },
        { status: 401 }
      );
    }

    if (!body?._type) {
      return NextResponse.json(
        { message: 'Bad Request: missing _type' },
        { status: 400 }
      );
    }

    // Revalidate cache tag berdasarkan brokerUuid
    if (body._type === 'brokerReview' && body.brokerUuid) {
      revalidateTag(`broker-${body.brokerUuid}`, 'max');
      return NextResponse.json({
        revalidated: true,
        tag: `broker-${body.brokerUuid}`,
      });
    }

    return NextResponse.json({
      message: 'No matching revalidation rule',
      body,
    });
  } catch (error) {
    console.error('Revalidate webhook error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}