import { PropsWithChildren, useEffect } from 'react';
import { Header } from '~/components/Header';

type LayoutProps = {
  hideHeader?: boolean;
  hideFooter?: boolean;
};

// eventually fix the footer so we can display it
const Layout = ({
  hideHeader = false,
  hideFooter = true,
  children,
}: PropsWithChildren<LayoutProps>) => {
  useEffect(() => {
    const key = localStorage.getItem('supabaseDarkMode');
    if (!key) {
      document.documentElement.className = 'dark';
    } else {
      document.documentElement.className = key === 'true' ? 'dark' : '';
    }
  }, []);

  return (
    <>
      {!hideHeader && <Header />}
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow">{children}</main>
        {!hideFooter && (
          <div className="mt-auto">
          </div>
        )}
      </div>
    </>
  );
};

export default Layout;