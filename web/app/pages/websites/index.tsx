// websites/index.tsx
import { IconLoader, IconSearch, Input } from '@supabase/ui';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import AddAWebsite from '~/components/AddAWebsite';
import Layout from '~/components/Layout';
import WebsiteLinkBox from '~/components/WebsiteLinkBox';
import WebsiteTileGrid from '~/components/WebsiteTileGrid';
import SectionContainer from '~/components/SectionContainer';
import supabase from '~/lib/supabase';
import { WebsiteRow } from '~/types/websites';

export async function getStaticProps() {
  const { data: websites, error } = await supabase
    .from('websites')
    .select('*')
    .order('site_name');

  if (error) {
    console.error('Error fetching websites:', error);
    return { props: { websites: [] } };
  }

  return {
    props: {
      websites: websites ?? [],
    },
    revalidate: 18000, // In seconds - refresh every 5 hours
  };
}

interface Props {
  websites: WebsiteRow[];
}

function IntegrationWebsitesPage(props: Props) {
  const { websites: initialWebsites } = props;
  const [websites, setWebsites] = useState(initialWebsites);

  const router = useRouter();

  const meta_title = 'Find a simplified terms of service';
  const meta_description = 'Terms of services simplified for our understanding';

  const [search, setSearch] = useState('');
  const [debouncedSearchTerm] = useDebounce(search, 300);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const searchWebsites = async () => {
      setIsSearching(true);

      let query = supabase
        .from('websites')
        .select('*')
        .order('site_name');

      if (search.trim()) {
        query = query.ilike('site_name', `%${search.trim()}%`);
      }

      const { data: websites } = await query;

      return websites;
    };

    if (search.trim() === '') {
      setIsSearching(false);
      setWebsites(initialWebsites);
      return;
    }

    searchWebsites().then((websites) => {
      if (websites) {
        setWebsites(websites);
      }

      setIsSearching(false);
    });
  }, [debouncedSearchTerm, router]);

  return (
    <>
      <Head>
        <title>{meta_title} | TOS Buddy</title>
        <meta name="description" content={meta_description}></meta>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <SectionContainer className="space-y-16">
          <div>
            <h1 className="h1">{meta_title}</h1>
            <h2 className="text-xl text-scale-900">{meta_description}</h2>
          </div>
          {/* Title */}
          <div className="grid space-y-12 md:gap-8 lg:grid-cols-12 lg:gap-16 lg:space-y-0 xl:gap-16">
            <div className="lg:col-span-4 xl:col-span-3">
              {/* Horizontal link menu */}
              <div className="space-y-6">
                {/* Search Bar */}
                <Input
                  size="small"
                  icon={<IconSearch />}
                  placeholder="Search..."
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  actions={
                    isSearching && (
                      <span className="mr-1 animate-spin text-white">
                        <IconLoader />
                      </span>
                    )
                  }
                />
                <div className="space-y-4">
                  <div className="mb-2 text-sm text-scale-900">
                    Explore more
                  </div>
                  <div className="grid grid-cols-2 gap-8 lg:grid-cols-1">
                    <WebsiteLinkBox
                      title="Most Popular"
                      color="blue"
                      description="View the most popular websites"
                      href={`/popular`}
                      icon={
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="1"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      }
                    />

                    <WebsiteLinkBox
                      href={`/websites#add-a-website`}
                      title="Add a website"
                      color="brand"
                      description="Fill out a quick 30 second form to apply to add a website"
                      icon={
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="1"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-8 xl:col-span-9">
              {/* Website Tiles */}
              <div className="grid space-y-10">
                {websites.length ? (
                  <WebsiteTileGrid websites={websites} />
                ) : (
                  <h2 className="h2">No Companies Found</h2>
                )}
              </div>
            </div>
          </div>
          {/* Add a website form */}
        </SectionContainer>
        <AddAWebsite supabase={supabase} />
      </Layout>
    </>
  );
}

export default IntegrationWebsitesPage;