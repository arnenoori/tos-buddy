import Link from 'next/link';
import { WebsiteRow } from '~/types/websites';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { useEffect, useState } from 'react';

export default function WebsiteTileGrid({
  websites,
}: {
  websites: WebsiteRow[];
}) {
  // Add client-side only rendering for hover effects
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <ul role="list" className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {websites.map((website) => (
        <li key={website.id} className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 group">
          <Link href={`/${website.site_name}`} legacyBehavior>
            <a className="flex flex-col h-full p-6">
              <div className="flex w-full items-center justify-between space-x-6 mb-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-1000">{website.site_name}</h3>
                  {website.category && (
                    <span className="mt-2 inline-flex flex-shrink-0 items-center rounded-full bg-green-50 px-2 py-0.5 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                      {website.category}
                    </span>
                  )}
                </div>
                <div className="w-20 h-20 flex-shrink-0 rounded-full">
                  {website.logo_svg ? (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      dangerouslySetInnerHTML={{ __html: website.logo_svg }}
                      style={{ maxWidth: '100%', maxHeight: '100%' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-full">
                      <span className="text-gray-900"></span>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-md text-gray-900 mb-4">
                {website.website_description || 'No description available'}
              </p>
              {isMounted && (
                <div className="mt-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span
                    className="relative inline-flex w-full items-center justify-center gap-x-3 rounded-lg border border-transparent py-4 text-sm font-semibold text-gray-900 bg-gray-100 hover:bg-gray-200"
                  >
                    <ArrowRightIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    Go to Summary
                  </span>
                </div>
              )}
            </a>
          </Link>
        </li>
      ))}
    </ul>
  );
}