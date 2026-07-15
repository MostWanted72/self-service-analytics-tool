/* src/app/studio/layout.tsx */
import React from 'react';
import { StudioLayout } from '../../components/studio/StudioLayout/StudioLayout';

export default function StudioRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StudioLayout>{children}</StudioLayout>;
}
