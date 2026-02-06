
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Grid, CreditCard, Receipt, Info, Menu, X } from 'lucide-react';

const Layout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/plots', label: 'Plots', icon: Grid },
    { to: '/payments', label: 'Payments', icon: CreditCard },
    { to: '/expenses', label: 'Expenses', icon: Receipt },
    { to: '/project', label: 'Project', icon: Info },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 bg-slate-900 text-white flex-col sticky top-0 h-screen">
        <div className="p-6">
          <h1 className="text-xl font-bold tracking-tight">LandPlot CRM</h1>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Header - Mobile */}
      <header className="md:hidden bg-slate-900 text-white p-4 sticky top-0 z-50 flex items-center justify-between">
        <h1 className="text-lg font-bold">LandPlot CRM</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-900 text-white pt-16">
          <nav className="p-6 space-y-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-4 p-4 rounded-xl text-lg ${
                    isActive ? 'bg-blue-600' : 'bg-slate-800'
                  }`
                }
              >
                <item.icon size={24} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation (Persistent CTA) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 z-30">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 rounded-lg ${
                isActive ? 'text-blue-600' : 'text-slate-500'
              }`
            }
          >
            <item.icon size={20} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="md:hidden h-16" /> {/* Spacer for bottom nav */}
    </div>
  );
};

export default Layout;
