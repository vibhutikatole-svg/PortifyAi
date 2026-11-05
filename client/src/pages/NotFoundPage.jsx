import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import { ArrowLeft, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-slate-50 p-4">
      <div className="text-center max-w-md">
        <span className="text-6xl font-extrabold text-indigo-600 font-mono">404</span>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-4">Page Not Found</h1>
        <p className="text-xs text-slate-500 mt-2 mb-6">
          The page you requested could not be located. It might have moved or the URL might be incorrect.
        </p>
        <Link to="/">
          <Button variant="primary" size="md" icon={Home}>
            Return to Homepage
          </Button>
        </Link>
      </div>
    </div>
  );
}

