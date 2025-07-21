"use client";

import NavbarWithAuth from '@/components/navbar-with-auth';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function LayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <NavbarWithAuth />
      <main>{children}</main>
    </ProtectedRoute>
  );
} 