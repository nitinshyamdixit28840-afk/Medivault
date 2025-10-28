import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { NAV_LINKS } from '../constants';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const navLinkClasses = "flex items-center p-2 text-gray-700 rounded-lg hover:bg-teal-100";
    const activeNavLinkClasses = "bg-teal-200 text-teal-800";

    const sidebar = (
        <aside className="w-64 h-full" aria-label="Sidebar">
            <div className="overflow-y-auto py-4 px-3 bg-white h-full shadow-lg">
                <div className="flex items-center pl-2.5 mb-5">
                    <img src="https://picsum.photos/40/40" className="h-8 w-8 rounded-full mr-3" alt="Medivault Logo" />
                    <span className="self-center text-xl font-semibold whitespace-nowrap text-teal-700">Medivault</span>
                </div>
                <ul className="space-y-2">
                    {NAV_LINKS.map((link) => (
                        <li key={link.name}>
                            <NavLink
                                to={link.path}
                                className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}
                                onClick={() => setIsSidebarOpen(false)}
                            >
                                <link.icon className="w-6 h-6 text-teal-500" />
                                <span className="ml-3">{link.name}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Desktop Sidebar */}
            <div className="hidden md:flex flex-shrink-0">
                {sidebar}
            </div>

            {/* Mobile Sidebar */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden" onClick={() => setIsSidebarOpen(false)}>
                    <div className="fixed inset-y-0 left-0 z-40" onClick={(e) => e.stopPropagation()}>
                        {sidebar}
                    </div>
                </div>
            )}
            
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex justify-between items-center p-4 bg-white border-b md:hidden">
                    <button onClick={() => setIsSidebarOpen(true)} className="text-gray-500 focus:outline-none">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </button>
                    <h1 className="text-xl font-semibold text-teal-700">Medivault</h1>
                    <div className="w-6"></div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-6 lg:p-8 relative">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;