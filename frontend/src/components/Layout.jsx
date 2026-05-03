import { Outlet } from 'react-router-dom';
import TopNav from './TopNav';

const Layout = () => (
  <div className="app-shell">
    <TopNav />
    <main className="page-wrap">
      <Outlet />
    </main>
  </div>
);

export default Layout;
