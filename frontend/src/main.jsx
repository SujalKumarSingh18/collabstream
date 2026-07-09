import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import Layout from './Layout.jsx'
import Dashboard from './components/Dashboard/Dashboard.jsx'
import Kanban from './components/Kanban/Kanban.jsx'
import Converter from './components/Converter/Converter.jsx'

import Videos from './components/Videos/Videos.jsx'
import VideoPlayer from './components/Videos/VideoPlayer.jsx'
import Community from './components/Community/Community.jsx'
import Login from './components/Login/Login.jsx'
import Register from './components/Register/Register.jsx'
import axios from 'axios';

// Set Axios defaults for production serverless deployments
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';
axios.defaults.withCredentials = true;

// Axios request interceptor to automatically attach JWT authorization headers if present
axios.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Layout />}>
        <Route path="" element={<Dashboard />} />
        <Route path="videos" element={<Videos />} />
        <Route path="videos/:videoId" element={<VideoPlayer />} />
        <Route path="kanban" element={<Kanban />} />
        <Route path="community" element={<Community />} />
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
