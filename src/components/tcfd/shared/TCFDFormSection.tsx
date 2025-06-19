
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
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold text-slate-800">
          {title}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {description && (
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">
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
