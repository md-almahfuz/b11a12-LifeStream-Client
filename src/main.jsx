import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css'
import { RouterProvider } from 'react-router'
import Router from './routes/Router.jsx'
import { ToastContainer } from 'react-toastify'
import AuthProvider from './provider/AuthProvider.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // Import the necessary components

// Create a client for TanStack Query
const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* The AuthProvider component is used to provide authentication context to the application */}
    <AuthProvider>
      {/* Wrap your application with the QueryClientProvider */}
      <QueryClientProvider client={queryClient}>
        {/* The RouterProvider component is used to provide the router to the application */}
        <RouterProvider router={Router}></RouterProvider>
      </QueryClientProvider>
      {/* The ToastContainer component is used to display toast notifications */}
      <ToastContainer></ToastContainer>
    </AuthProvider>
  </StrictMode>,
)
