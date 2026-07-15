import {
  Baby,
  FileText,
  IndianRupee,
  ScrollText,
  Home,
  Droplets,
  Zap,
  Car,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  'birth-certificate': Baby,
  'death-certificate': FileText,
  'income-certificate': IndianRupee,
  'caste-certificate': ScrollText,
  'property-tax': Home,
  'water-connection': Droplets,
  'electricity-connection': Zap,
  'driving-licence-renewal': Car,
};

export function getServiceIcon(slug: string): LucideIcon {
  return iconMap[slug] || FileText;
}

interface ServiceIconProps {
  slug: string;
  className?: string;
}

export function ServiceIcon({ slug, className = 'w-6 h-6' }: ServiceIconProps) {
  const Icon = getServiceIcon(slug);
  return <Icon className={className} aria-hidden="true" />;
}
