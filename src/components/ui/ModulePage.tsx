// Benita Granites — Module Page Template
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Construction } from 'lucide-react';

interface ModulePageProps {
  title: string;
  description: string;
  icon?: LucideIcon;
}

export default function ModulePage({ title, description, icon: Icon = Construction }: ModulePageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-4 lg:p-6"
    >
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-navy tracking-tight">{title}</h1>
        <p className="text-sm text-text-secondary mt-1">{description}</p>
      </div>

      <div className="bg-surface rounded-xl border border-border p-8 sm:p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-navy-50 flex items-center justify-center mx-auto mb-4">
          <Icon className="w-8 h-8 text-navy" />
        </div>
        <h2 className="text-lg font-semibold text-text-primary mb-2">{title}</h2>
        <p className="text-sm text-text-secondary max-w-md mx-auto">
          {description}. This module is being built and will be available soon.
        </p>
        <div className="flex items-center justify-center gap-2 mt-6">
          <div className="w-2 h-2 bg-teal rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-teal rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-teal rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </motion.div>
  );
}
