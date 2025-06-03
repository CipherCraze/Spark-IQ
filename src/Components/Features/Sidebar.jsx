// src/components/Sidebar.jsx
import React, { useState } from 'react';
// Assuming you're using React Router, otherwise use <a> tags
// import { Link, useLocation } from 'react-router-dom'; 
import { FiChevronDown, FiChevronRight, FiLogOut } from 'react-icons/fi'; // Example icons

// Dummy Link and useLocation for standalone example. Replace with actual router components.
const Link = ({ to, children, className, ...props }) => <a href={to} className={className} {...props}>{children}</a>;
const useLocation = () => ({ pathname: '/smart-review' }); // Mock current path for 'Smart Review'

const Sidebar = ({ menuItems, appName = "SPARK-IQ", userRole = "Student" }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // For collapsibility

  // Example user data - replace with actual context or props
  const user = {
    name: "Alex Johnson",
    avatarUrl: "https://via.placeholder.com/100/A78BFA/FFFFFF?Text=A" // Purple placeholder
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <aside 
      className={`
        h-screen sticky top-0 flex flex-col bg-slate-900/80 dark:bg-slate-900/90 backdrop-blur-xl 
        border-r border-slate-700/50 dark:border-slate-800/50 
        transition-all duration-300 ease-in-out custom-scrollbar overflow-y-auto
        ${isSidebarOpen ? 'w-72 p-5' : 'w-20 p-3 items-center'}
      `}
    >
      {/* Header & Toggle */}
      <div className={`mb-8 flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
        {isSidebarOpen && (
          <Link to="/" className="flex items-center gap-2 group">
            {/* <img src="/logo.svg" alt="App Logo" className="h-8 w-auto" /> Replace with your logo */}
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-cyan-400 to-purple-500 group-hover:opacity-80 transition-opacity">
              {appName}
            </span>
          </Link>
        )}
        <button 
          onClick={toggleSidebar} 
          title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          className="p-2 rounded-full text-slate-400 hover:text-teal-400 bg-slate-700/50 hover:bg-purple-600/20 transition-all"
        >
          {isSidebarOpen ? <FiChevronDown className="w-5 h-5 transform rotate-90" /> : <FiChevronRight className="w-5 h-5 transform rotate-90"/>}
        </button>
      </div>

      

      {/* Navigation */}
      <nav className="flex-grow">
        <ul className="space-y-1.5">
          {menuItems.map((item) => {
            const isActive = item.current || location.pathname === item.link;
            return (
              <li key={item.title}>
                <Link
                  to={item.link}
                  title={item.description || item.title}
                  className={`
                    flex items-center gap-3 rounded-lg transition-all duration-200 ease-in-out group
                    ${isSidebarOpen ? 'px-4 py-3' : 'p-3 justify-center'}
                    ${isActive
                      ? 'bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-500 text-white shadow-lg hover:opacity-90'
                      : `text-slate-400 dark:text-slate-500 hover:bg-slate-700/50 dark:hover:bg-slate-700/70 hover:text-slate-100 dark:hover:text-slate-50 
                         ${item.special ? '!text-yellow-400 dark:!text-yellow-500 hover:!bg-yellow-500/10 dark:hover:!bg-yellow-500/20 hover:!text-yellow-300 dark:hover:!text-yellow-400' : ''}`
                    }
                  `}
                >
                  <item.Icon 
                    className={`
                      w-5 h-5 flex-shrink-0 
                      ${isActive ? 'text-white' : (item.special ? 'text-yellow-400 dark:text-yellow-500 group-hover:text-yellow-300 dark:group-hover:text-yellow-400' : 'text-purple-400 dark:text-purple-500 group-hover:text-teal-400 dark:group-hover:text-teal-300')}
                      transition-colors
                    `} 
                  />
                  {isSidebarOpen && (
                    <span className="text-sm font-medium">{item.title}</span>
                  )}
                  {isActive && !isSidebarOpen && (
                     <span className="absolute left-full ml-1 w-1.5 h-6 bg-purple-500 rounded-r-md"></span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer / Logout (conditionally rendered) */}
      {isSidebarOpen && (
        <div className="mt-auto pt-4 border-t border-slate-700/50 dark:border-slate-800/70">
          <button 
            onClick={() => alert("Logout action!")} // Replace with actual logout logic
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 dark:text-slate-500 hover:bg-red-500/10 dark:hover:bg-red-500/20 hover:text-red-400 dark:hover:text-red-300 transition-colors duration-200 group"
          >
            <FiLogOut className="w-5 h-5 text-red-500 group-hover:text-red-400 transition-colors" />
            <span className="text-sm font-medium">Logout</span>
          </button>
          <p className="text-xs text-slate-600 dark:text-slate-700 text-center mt-4">
            © {new Date().getFullYear()} {appName}
          </p>
        </div>
      )}
       {!isSidebarOpen && (
         <div className="mt-auto pt-2 border-t border-slate-700/50 dark:border-slate-800/70 flex justify-center">
            <button 
                onClick={() => alert("Logout action!")} // Replace with actual logout logic
                title="Logout"
                className="p-3 rounded-full text-slate-400 dark:text-slate-500 hover:bg-red-500/10 dark:hover:bg-red-500/20 hover:text-red-400 dark:hover:text-red-300 transition-colors duration-200 group"
            >
                <FiLogOut className="w-5 h-5 text-red-500 group-hover:text-red-400 transition-colors" />
            </button>
         </div>
       )}
    </aside>
  );
};

export default Sidebar;