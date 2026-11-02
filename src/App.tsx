import { lazy } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './app/AppLayout'

const QuotationsPage = lazy(
  () => import('./features/quotes/QuotationsPage'),
)
const QuotationEditorPage = lazy(
  () => import('./features/quotes/QuotationEditorPage'),
)
const QuotationPreviewPage = lazy(
  () => import('./features/quotes/QuotationPreviewPage'),
)
const SettingsPage = lazy(() => import('./features/settings/SettingsPage'))

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<QuotationsPage />} />
          <Route path="quotes/new" element={<QuotationEditorPage />} />
          <Route path="quotes/:id/edit" element={<QuotationEditorPage />} />
          <Route path="quotes/:id" element={<QuotationPreviewPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
