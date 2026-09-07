import React from 'react';
import * as Icons from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-4 h-4', size = 16 }) => {
  // Try to find icon in lucide-react exports
  const IconComponent = (Icons as Record<string, any>)[name] || Icons.Tag;
  return <IconComponent className={className} size={size} />;
};

export const AVAILABLE_ICONS = [
  'Activity',
  'Briefcase',
  'Code2',
  'Cpu',
  'Dumbbell',
  'BookOpen',
  'Compass',
  'Sparkles',
  'HeartPulse',
  'Zap',
  'Coffee',
  'FlaskConical',
  'FileText',
  'Users',
  'Smile',
  'Music',
  'Film',
  'Flame',
  'GraduationCap',
  'Layers',
  'Mail',
  'Terminal',
  'Workflow',
  'PenTool',
];

export const PRESET_COLORS = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#e11d48', // Rose
  '#64748b', // Slate
];
