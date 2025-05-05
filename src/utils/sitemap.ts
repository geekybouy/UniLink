
/**
 * Sitemap generator utility
 */

export type SitemapEntry = {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
};

/**
 * Generate XML sitemap content
 */
export const generateSitemap = (entries: SitemapEntry[], baseUrl: string): string => {
  const xmlEntries = entries
    .map(entry => {
      // Ensure URL is absolute
      const absoluteUrl = entry.url.startsWith('http')
        ? entry.url
        : `${baseUrl}${entry.url.startsWith('/') ? entry.url : `/${entry.url}`}`;
      
      return `  <url>
    <loc>${absoluteUrl}</loc>
    ${entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : ''}
    ${entry.changefreq ? `<changefreq>${entry.changefreq}</changefreq>` : ''}
    ${entry.priority !== undefined ? `<priority>${entry.priority}</priority>` : ''}
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlEntries}
</urlset>`;
};

/**
 * Standard routes for sitemap
 */
export const getStandardRoutes = (): SitemapEntry[] => {
  return [
    { url: '/', changefreq: 'weekly', priority: 1.0 },
    { url: '/dashboard', changefreq: 'daily', priority: 0.9 },
    { url: '/alumni-directory', changefreq: 'weekly', priority: 0.8 },
    { url: '/events', changefreq: 'daily', priority: 0.8 },
    { url: '/jobs', changefreq: 'daily', priority: 0.8 },
    { url: '/knowledge-hub', changefreq: 'daily', priority: 0.7 },
    { url: '/mentorship/dashboard', changefreq: 'weekly', priority: 0.7 },
    { url: '/mentorship/become-mentor', changefreq: 'monthly', priority: 0.6 },
    { url: '/mentorship/find-mentors', changefreq: 'weekly', priority: 0.7 },
    { url: '/mentorship/success-stories', changefreq: 'monthly', priority: 0.5 },
    { url: '/cv-maker', changefreq: 'monthly', priority: 0.5 },
    { url: '/credential-wallet', changefreq: 'monthly', priority: 0.4 },
  ];
};

/**
 * Generate dynamic pages for the sitemap (e.g., user profiles)
 */
export const generateDynamicSitemapEntries = async (
  fetchFunction: () => Promise<{ id: string; updated_at?: string }[]>,
  urlTemplate: (id: string) => string,
  changefreq: SitemapEntry['changefreq'] = 'weekly',
  priority: number = 0.5
): Promise<SitemapEntry[]> => {
  try {
    const items = await fetchFunction();
    
    return items.map(item => ({
      url: urlTemplate(item.id),
      lastmod: item.updated_at || new Date().toISOString().split('T')[0],
      changefreq,
      priority,
    }));
  } catch (error) {
    console.error('Error generating dynamic sitemap entries:', error);
    return [];
  }
};

/**
 * Create and download sitemap XML file
 */
export const downloadSitemap = (entries: SitemapEntry[], baseUrl: string): void => {
  const sitemapContent = generateSitemap(entries, baseUrl);
  const blob = new Blob([sitemapContent], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'sitemap.xml';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
