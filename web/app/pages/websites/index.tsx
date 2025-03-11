// websites/index.tsx
import { IconLoader, IconSearch } from '@supabase/ui';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState, Fragment } from 'react';
import { useDebounce } from 'use-debounce';
import { Layout } from '~/components/Layout'; // Updated import to use the new Layout
import WebsiteTileGrid from '~/components/WebsiteTileGrid';
import SectionContainer from '~/components/SectionContainer';
import supabase from '~/lib/supabase';
import { WebsiteRow } from '~/types/websites';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

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

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

function IntegrationWebsitesPage(props: Props) {
  const { websites: initialWebsites } = props;
  const [websites, setWebsites] = useState(initialWebsites);
  const [categories, setCategories] = useState<{ [key: string]: number }>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 40;

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

      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }

      const { data: websites } = await query;

      return websites;
    };

    if (search.trim() === '' && !selectedCategory) {
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
  }, [debouncedSearchTerm, selectedCategory, router]);

  useEffect(() => {
    const categoryCount: { [key: string]: number } = {};
    initialWebsites.forEach((website) => {
      if (website.category) {
        categoryCount[website.category] = (categoryCount[website.category] || 0) + 1;
      }
    });
    setCategories(categoryCount);
  }, [initialWebsites]);

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const paginatedWebsites = websites.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Layout>
      <Head>
        <title>{meta_title}</title>
        <meta name="description" content={meta_description} />
      </Head>
      <div className="flex flex-col min-h-full w-full">
        <div className="bg-white">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                Find a simplified terms of service
              </h1>
              <p className="mt-4 text-lg leading-8 text-gray-600">
                Terms of services simplified for our understanding
              </p>
            </div>
          </div>
        </div>
        
        <SectionContainer>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IconSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {isSearching && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <IconLoader className="h-5 w-5 text-gray-400 animate-spin" />
                </div>
              )}
            </div>
            
            <Menu as="div" className="relative inline-block text-left w-full sm:w-auto">
              <div>
                <Menu.Button className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  {selectedCategory || 'Select a category'}
                  <ChevronDownIcon className="w-5 h-5 ml-2 -mr-1" aria-hidden="true" />
                </Menu.Button>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 w-56 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => handleCategoryChange(null)}
                          className={classNames(
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                            'block px-4 py-2 text-sm w-full text-left'
                          )}
                        >
                          All Categories
                        </button>
                      )}
                    </Menu.Item>
                    {Object.keys(categories).map((category) => (
                      <Menu.Item key={category}>
                        {({ active }) => (
                          <button
                            onClick={() => handleCategoryChange(category)}
                            className={classNames(
                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                              'block px-4 py-2 text-sm w-full text-left'
                            )}
                          >
                            {category} ({categories[category]})
                          </button>
                        )}
                      </Menu.Item>
                    ))}
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
          
          <div className="mt-8">
            <WebsiteTileGrid websites={paginatedWebsites} />
          </div>
          
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 mx-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={currentPage * itemsPerPage >= websites.length}
              className="px-4 py-2 mx-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </SectionContainer>
      </div>
    </Layout>
  );
}

export default IntegrationWebsitesPage;