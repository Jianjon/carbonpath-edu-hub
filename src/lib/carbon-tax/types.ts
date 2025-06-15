
import { ReactNode } from 'react';

export type ReductionModel = 'none' | 'sbti' | 'taiwan' | 'steel' | 'cement';

export interface Rate {
  value: number;
  label: string;
  description: ReactNode;
}

export interface FeeProjectionItem {
    year: number;
    emissions: number;
    fee: number;
}
