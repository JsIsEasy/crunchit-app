import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:"Admin",
  description:"This page is intended to use by admin",
  robots: { index: false, follow: false },
};

function AdminPage () {
  return <div>Admin Page</div>;
}

export default AdminPage;
