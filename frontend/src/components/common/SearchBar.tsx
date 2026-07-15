import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  size?: 'md' | 'lg';
  className?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search...', size = 'md', className = '' }: SearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <Search
        className={`absolute left-4 top-1/2 -translate-y-1/2 text-gov-muted ${size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'}`}
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`gov-input pl-11 w-full ${size === 'lg' ? 'py-3 text-base' : ''}`}
        aria-label={placeholder}
      />
    </div>
  );
}
