import React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon = FolderOpen,
  className = ""
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center rounded-xl bg-slate-900/50 border border-slate-800 text-slate-400 ${className}`}>
      <div className="p-4 bg-slate-800/60 rounded-full mb-4 text-purple-400">
        <Icon className="h-10 w-10" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 max-w-md mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium px-6 shadow-md"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
