import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  Building2,
  BookCheck,
  ChevronLeft,
  ChevronRight,
  Receipt,
  BookOpen,
  Cpu
} from 'lucide-react';

const NavItem = ({ 
  to, 
  icon: Icon, 
  children, 
  isCollapsed
}: { 
  to: string; 
  icon: React.ElementType; 
  children: React.ReactNode;
  isCollapsed: boolean;
}) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
        isActive
          ? 'bg-indigo-50 text-indigo-600'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`
    }
    title={isCollapsed ? String(children) : undefined}
  >
    <Icon className="h-5 w-5 flex-shrink-0" />
    {!isCollapsed && <span className="flex-1">{children}</span>}
  </NavLink>
);

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const user = useAuthStore(state => state.user);
  const isAdmin = user?.role === 'admin';

  return (
    <aside className={`relative bg-white border-r border-gray-200 p-4 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-white border border-gray-200 rounded-full p-1 hover:bg-gray-50"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-gray-600" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        )}
      </button>

      <nav className="space-y-1">
        <NavItem to="/dashboard" icon={LayoutDashboard} isCollapsed={isCollapsed}>
          Dashboard
        </NavItem>
        
        {isAdmin && (
          <>
            <NavItem to="/standards" icon={BookCheck} isCollapsed={isCollapsed}>
              Standards
            </NavItem>
            <NavItem to="/chart-of-accounts" icon={BookOpen} isCollapsed={isCollapsed}>
              Chart of Accounts
            </NavItem>
          </>
        )}

        <NavItem to="/companies" icon={Building2} isCollapsed={isCollapsed}>
          Companies
        </NavItem>

        <NavItem to="/transactions" icon={Receipt} isCollapsed={isCollapsed}>
          Transactions
        </NavItem>

        <NavItem to="/reports" icon={FileText} isCollapsed={isCollapsed}>
          Reports
        </NavItem>

        {isAdmin && (
          <>
            <hr className="my-4 border-gray-200" />
            <NavItem to="/rag-test" icon={Cpu} isCollapsed={isCollapsed}>
              RAG Test
            </NavItem>
            <NavItem to="/users" icon={Users} isCollapsed={isCollapsed}>
              Users
            </NavItem>
            <NavItem to="/settings" icon={Settings} isCollapsed={isCollapsed}>
              Settings
            </NavItem>
          </>
        )}
      </nav>
    </aside>
  );
};