import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import Projects from './pages/Projects'
import TimeEntries from './pages/TimeEntries'
import Departments from './pages/Departments'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'customers', element: <Customers /> },
      { path: 'departments', element: <Departments /> },
      { path: 'projects', element: <Projects /> },
      { path: 'time', element: <TimeEntries /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
