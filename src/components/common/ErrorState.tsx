import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message,
  onRetry,
  className = ""
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center rounded-xl bg-red-950/20 border border-red-800/40 text-red-200 max-w-lg mx-auto ${className}`}>
      <div className="p-3 bg-red-900/30 rounded-full mb-3 text-red-400">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      <p className="text-sm text-red-300/80 mb-4">{message}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="border-red-700 bg-red-950/50 hover:bg-red-900 text-white flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
