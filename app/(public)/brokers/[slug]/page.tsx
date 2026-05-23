import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import DOMPurify from 'isomorphic-dompurify';
import { getBrokerBySlug, getBrokerReview } from '@/lib/brokers/queries';
import BrokerDetailCard from '@/components/broker/BrokerDetailCard';
import '@/styles/broker-review.css';

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const broker = await getBrokerBySlug(resolvedParams.slug);

  if (!broker) return { title: 'Broker Not Found | MyTradingReviews' };

  const review = await getBrokerReview(broker.uuid);

  return {
    title: review?.seoTitle || `${broker.name} Review & Rating - MyTradingReviews`,
    description:
      review?.seoDescription ||
      `Read our comprehensive review and analysis for ${broker.name}.`,
  };
}

export default async function BrokerDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const broker = await getBrokerBySlug(resolvedParams.slug);

  if (!broker) {
    notFound();
  }

  const review = await getBrokerReview(broker.uuid);

  // Sanitize HTML untuk prevent XSS, tetep allow tag editorial standard
  const sanitizedHtml = review?.htmlContent
    ? DOMPurify.sanitize(review.htmlContent, {
        ALLOWED_TAGS: [
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'p', 'br', 'hr',
          'strong', 'b', 'em', 'i', 'u', 's', 'mark', 'sup', 'sub',
          'ul', 'ol', 'li',
          'a',
          'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption',
          'blockquote', 'q', 'cite',
          'figure', 'figcaption',
          'img',
          'div', 'span',
          'code', 'pre',
          'details', 'summary',
        ],
        ALLOWED_ATTR: [
          'href', 'target', 'rel',
          'src', 'alt', 'title', 'width', 'height', 'loading',
          'class', 'id',
          'colspan', 'rowspan',
          'open',
        ],
        ALLOW_DATA_ATTR: false,
      })
    : null;

  return (
    <div className="py-8">
      <BrokerDetailCard broker={broker} />

      <div className="mt-12 max-w-310 mx-auto">
        {sanitizedHtml ? (
          <article className="broker-review-content bg-[#0F1825] p-6 md:p-10 rounded-lg border border-[rgba(255,255,255,0.22)]">
            <h2 className="text-2xl font-bold text-white mb-6 border-b border-[rgba(255,255,255,0.1)] pb-4">
              {broker.name} Review 2026: Is {broker.name} Safe, Regulated & Worth It?
            </h2>
            <div
              className="broker-review-html"
              dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />
          </article>
        ) : (
          <div className="bg-[#0F1825] p-6 rounded-lg border border-[rgba(255,255,255,0.22)] text-center">
            <h2 className="text-xl font-semibold text-white mb-2">Detailed Review Coming Soon</h2>
            <p className="text-[#b2b2b2]">
              Our editorial team is currently evaluating {broker.name} to bring you a comprehensive
              long-form review.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}