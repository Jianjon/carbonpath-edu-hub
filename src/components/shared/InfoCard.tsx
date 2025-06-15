
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InfoCardProps {
  icon: LucideIcon;
  title: string;
  description: React.ReactNode;
  themeColor?: 'blue' | 'green' | 'purple' | 'yellow' | 'orange';
  className?: string;
}

const InfoCard = ({ icon: Icon, title, description, themeColor = 'blue', className }: InfoCardProps) => {
  const themeClasses = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    orange: 'bg-orange-50 border-orange-200',
  };
  const textClasses = {
    blue: 'text-blue-800',
    green: 'text-green-800',
    purple: 'text-purple-800',
    yellow: 'text-yellow-800',
    orange: 'text-orange-800',
  };
  const iconClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    yellow: 'text-yellow-600',
    orange: 'text-orange-600',
  };

  return (
    <div className={cn('p-6 border rounded-lg', themeClasses[themeColor] || themeClasses.blue, className)}>
      <h2 className={cn('text-xl font-semibold flex items-center mb-3', textClasses[themeColor] || textClasses.blue)}>
        <Icon className={cn('h-6 w-6 mr-3', iconClasses[themeColor] || iconClasses.blue)} />
        {title}
      </h2>
      <div className="text-gray-700 leading-relaxed">
        {description}
      </div>
    </div>
  );
};
export default InfoCard;
