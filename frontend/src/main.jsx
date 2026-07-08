import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import Layout from './Layout.jsx'
import Dashboard from './components/Dashboard/Dashboard.jsx'
import Kanban from './components/Kanban/Kanban.jsx'
import Converter from './components/Converter/Converter.jsx'

import Login from './components/Login/Login.jsx'
import Register from './components/Register/Register.jsx'

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Layout />}>
        <Route path="" element={<Dashboard />} />
        <Route path="kanban" element={<Kanban />} />
        <Route path="converter" element={<Converter />} />
        <Route path="*" element={<div className="p-8 text-center text-gray-500">View Not Found</div>} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </>
  )
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
