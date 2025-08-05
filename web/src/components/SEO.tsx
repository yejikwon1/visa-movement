import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  twitterImage?: string;
  structuredData?: object;
  noIndex?: boolean;
}

const SEO: React.FC<SEOProps> = ({
  title = 'Visa Bulletin Priority Date Checker | Track Your Immigration Status',
  description = 'Check your visa bulletin priority date and track immigration status. Real-time updates for family and employment-based visas. Free priority date calculator and visa bulletin tracker.',
  keywords = 'visa bulletin, priority date, immigration status, green card, family visa, employment visa, visa tracker, priority date checker, immigration calculator, visa bulletin dates',
  canonical = 'https://trackusvisa.com',
  ogImage = 'https://trackusvisa.com/og-image.jpg',
  twitterImage = 'https://trackusvisa.com/twitter-image.jpg',
  structuredData,
  noIndex = false,
}) => {
  const baseUrl = 'https://trackusvisa.com';
  const fullCanonical = canonical.startsWith('http') ? canonical : `${baseUrl}${canonical}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullCanonical} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Visa Movement" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullCanonical} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={twitterImage} />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO; 