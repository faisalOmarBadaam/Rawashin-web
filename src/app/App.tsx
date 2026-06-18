import Box from '@mui/material/Box'
import {RouterProvider } from 'react-router'
import './App.css'
import { router } from './routes/router'
import { Toaster } from "sonner";

function App() {

  return (
    <Box className="app-shell">
       <RouterProvider router={router} />
        <Toaster
        richColors
        position="top-center"
      />
    </Box>
  )
}

export default App
