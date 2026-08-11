import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';

import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';

import './AdminLayout.css';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="admin-layout">

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
      />

      {/* =====================================================
          MAIN AREA
      ====================================================== */}

      <div className="admin-layout-wrapper">

        {/* ===================================================
            HEADER
        ==================================================== */}

        <AdminHeader
          onToggleSidebar={handleToggleSidebar}
          sidebarOpen={sidebarOpen}
        />

        {/* ===================================================
            PAGE CONTENT
        ==================================================== */}

        <main className="admin-layout-content">
          <Outlet />
        </main>

      </div>

    </div>
  );
}