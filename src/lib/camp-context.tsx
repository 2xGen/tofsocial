'use client';

import { createContext, useContext } from 'react';
import type { CampConfig, CampId, CampSlug } from '@/lib/camp-config';
import { campBasePath } from '@/lib/camp-config';

type CampContextValue = {
  campId: CampId;
  slug: CampSlug;
  basePath: `/${CampSlug}`;
  name: string;
  label: string;
  shortLabel: string;
};

const CampContext = createContext<CampContextValue | null>(null);

export function CampProvider({
  camp,
  children,
}: {
  camp: CampConfig;
  children: React.ReactNode;
}) {
  const value: CampContextValue = {
    campId: camp.id,
    slug: camp.slug,
    basePath: campBasePath(camp.id),
    name: camp.name,
    label: camp.label,
    shortLabel: camp.shortLabel,
  };

  return <CampContext.Provider value={value}>{children}</CampContext.Provider>;
}

export function useCamp(): CampContextValue {
  const ctx = useContext(CampContext);
  if (!ctx) {
    throw new Error('useCamp must be used within CampProvider');
  }
  return ctx;
}
