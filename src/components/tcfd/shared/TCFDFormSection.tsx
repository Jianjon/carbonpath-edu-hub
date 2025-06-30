
import React from 'react';
import { Label } from '@/components/ui/label';

interface TCFDFormSectionProps {
  title: string;
  description?: string;
  required?: boolean;
  children: React.ReactNode;
}

export const TCFDFormSection: React.FC<TCFDFormSectionProps> = ({
  title,
  description,
  required = false,
  children
}) => {
  return (
    <div className="space-y-4 p-1">
      <div>
        <Label className="text-base font-bold text-slate-800 tracking-wide">
          {title}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {description && (
          <p className="text-sm text-slate-600 mt-2 leading-relaxed font-medium">
            {description}
          </p>
        )}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

export default TCFDFormSection;
