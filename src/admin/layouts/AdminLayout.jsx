import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';

import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';

import './AdminLayout.css';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-layout">

      {/* SIDEBAR */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* MAIN AREA */}
      <div className="admin-layout-wrapper">

        <AdminHeader
          onToggleSidebar={() =>
            setSidebarOpen(!sidebarOpen)
          }
        />

        {/* PAGE CONTENT */}
        <main className="admin-layout-content">
          <Outlet />
        </main>

      </div>

    </div>
  );
}