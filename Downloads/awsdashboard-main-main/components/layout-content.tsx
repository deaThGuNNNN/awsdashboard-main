"use client";

import { useState } from 'react';
import Navbar from '@/components/navbar';

export default function LayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isTableView, setIsTableView] = useState(true);
  const [isEC2View, setIsEC2View] = useState(true);
  const [isRDSView, setIsRDSView] = useState(true);

  return (
    <>
      <Navbar
        isTableView={isTableView}
        setIsTableView={setIsTableView}
        isEC2View={isEC2View}
        setIsEC2View={setIsEC2View}
        isRDSView={isRDSView}
        setIsRDSView={setIsRDSView}
      />
      <main>{children}</main>
    </>
  );
} 