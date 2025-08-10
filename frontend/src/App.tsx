import { Outlet, NavLink } from 'react-router-dom'
import { useState } from 'react'
import { clsx } from 'clsx'

function NavItem({ to, label }: { to: string, label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => clsx(
        'px-3 py-2 rounded-md text-sm font-medium',
        isActive ? 'bg-primary-600 text-white' : 'text-gray-700 hover:bg-gray-100'
      )}
      end
    >
      {label}
    </NavLink>
  )
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16 gap-4">
          <button className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <span className="sr-only">Toggle navigation</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <div className="font-semibold text-primary-700">Time Manager</div>
          <nav className="ml-auto hidden md:flex gap-2">
            <NavItem to="/" label="Dashboard" />
            <NavItem to="/customers" label="Customers" />
            <NavItem to="/departments" label="Departments" />
            <NavItem to="/projects" label="Projects" />
            <NavItem to="/time" label="Time" />
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </div>
    </div>
  )
}
