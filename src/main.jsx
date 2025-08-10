import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css'
import { RouterProvider } from 'react-router'
import Router from './routes/Router.jsx'
import { ToastContainer } from 'react-toastify'
import AuthProvider from './provider/AuthProvider.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* The AuthProvider component is used to provide authentication context to the application */}
    <AuthProvider>
      {/* The RouterProvider component is used to provide the router to the application */}
      <RouterProvider router={Router}></RouterProvider>
      {/* The ToastContainer component is used to display toast notifications */}
      <ToastContainer></ToastContainer>
    </AuthProvider>
  </StrictMode>,
)
