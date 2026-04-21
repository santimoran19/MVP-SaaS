import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { ReservaPage } from '@/pages/ReservaPage'
import { AdminPage } from '@/pages/AdminPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ReservaPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster
        position="bottom-center"
        richColors
        expand={false}
        toastOptions={{
          style: { fontFamily: 'Inter, sans-serif' },
        }}
      />
    </BrowserRouter>
  )
}
