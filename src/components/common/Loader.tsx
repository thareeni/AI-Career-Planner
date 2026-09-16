import React from "react";
import { Loader2 } from "lucide-react";

interface LoaderProps {
  message?: string;
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({ message = "Loading...", className = "" }) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 space-y-4 ${className}`}>
      <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
      {message && <p className="text-sm font-medium text-slate-600 animate-pulse">{message}</p>}
    </div>
  );
};

export default Loader;
