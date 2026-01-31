import { ProtectedRoute } from '@/components/layout/protected-route'

export default function NewMemorialLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}
