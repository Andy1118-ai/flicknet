import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header toggleSidebar={toggleSidebar} />
      <div className="flex min-h-[calc(100vh-70px)]">
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-80' : ''}`}>
          <div className="p-8 max-w-6xl mx-auto w-full lg:p-8 md:p-6 sm:p-4">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed top-[70px] left-0 right-0 bottom-0 bg-black/50 z-30 lg:hidden"
          onClick={closeSidebar}
        />
      )}
    </div>
  );
};

export default Layout;
