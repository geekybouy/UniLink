
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
  canonicalUrl?: string;
  structuredData?: Record<string, any>;
  noIndex?: boolean;
}

export function SEO({
  title = 'UniLink - Connect, Network, Grow',
  description = 'UniLink - A platform for university alumni to connect, network, and grow professionally',
  keywords = 'alumni network, mentorship, professional development, university connections',
  ogImage = '/og-image.jpg',
  ogType = 'website',
  canonicalUrl,
  structuredData,
  noIndex = false,
}: SEOProps) {
  // Prepare JSON-LD structured data
  const jsonLd = structuredData
    ? JSON.stringify(structuredData)
    : JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'UniLink',
        url: window.location.origin,
        logo: `${window.location.origin}/logo.png`,
        description,
      });

  return (
    <Helmet>
      {/* Basic metadata */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Robots control */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage.startsWith('http') ? ogImage : `${window.location.origin}${ogImage}`} />
      <meta property="og:url" content={canonicalUrl || window.location.href} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage.startsWith('http') ? ogImage : `${window.location.origin}${ogImage}`} />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* JSON-LD structured data */}
      <script type="application/ld+json">{jsonLd}</script>
    </Helmet>
  );
}

export default SEO;
