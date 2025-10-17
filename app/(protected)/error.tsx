'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Home, RefreshCw, ArrowLeft } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error boundary for protected routes
 * Provides contextual recovery actions based on error type
 */
export default function ProtectedError({ error, reset }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Protected route error:', error);
    }

    // TODO: Send error to error tracking service in production
    // Example: Sentry.captureException(error);
  }, [error]);

  // Detect error type from message
  const errorMessage = error.message.toLowerCase();
  const isAuthError = errorMessage.includes('unauthorized') || 
                      errorMessage.includes('session') ||
                      errorMessage.includes('not authenticated');
  const isPermissionError = errorMessage.includes('permission') || 
                            errorMessage.includes('forbidden');
  const isNotFound = errorMessage.includes('not found');

  // Determine user-friendly message and recovery actions
  const getErrorInfo = () => {
    if (isAuthError) {
      return {
        title: 'Session Expired',
        message: 'Your session has expired. Please sign in again to continue.',
        icon: <AlertCircle className="h-12 w-12 text-destructive" />,
        actions: [
          {
            label: 'Sign In',
            onClick: () => router.push('/login'),
            variant: 'default' as const,
            icon: <Home className="h-4 w-4" />,
          },
        ],
      };
    }

    if (isPermissionError) {
      return {
        title: 'Access Denied',
        message: "You don't have permission to access this resource. Contact your organization owner if you believe this is a mistake.",
        icon: <AlertCircle className="h-12 w-12 text-destructive" />,
        actions: [
          {
            label: 'Go to Dashboard',
            onClick: () => router.push('/dashboard'),
            variant: 'default' as const,
            icon: <Home className="h-4 w-4" />,
          },
          {
            label: 'Go Back',
            onClick: () => router.back(),
            variant: 'outline' as const,
            icon: <ArrowLeft className="h-4 w-4" />,
          },
        ],
      };
    }

    if (isNotFound) {
      return {
        title: 'Resource Not Found',
        message: "The resource you're looking for doesn't exist or has been removed.",
        icon: <AlertCircle className="h-12 w-12 text-muted-foreground" />,
        actions: [
          {
            label: 'Go to Dashboard',
            onClick: () => router.push('/dashboard'),
            variant: 'default' as const,
            icon: <Home className="h-4 w-4" />,
          },
          {
            label: 'Go Back',
            onClick: () => router.back(),
            variant: 'outline' as const,
            icon: <ArrowLeft className="h-4 w-4" />,
          },
        ],
      };
    }

    // Generic server error
    return {
      title: 'Something Went Wrong',
      message: 'An unexpected error occurred. Our team has been notified. Please try again.',
      icon: <AlertCircle className="h-12 w-12 text-destructive" />,
      actions: [
        {
          label: 'Try Again',
          onClick: reset,
          variant: 'default' as const,
          icon: <RefreshCw className="h-4 w-4" />,
        },
        {
          label: 'Go to Dashboard',
          onClick: () => router.push('/dashboard'),
          variant: 'outline' as const,
          icon: <Home className="h-4 w-4" />,
        },
      ],
    };
  };

  const errorInfo = getErrorInfo();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex items-center justify-center">
            {errorInfo.icon}
          </div>
          <CardTitle className="text-2xl">{errorInfo.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground">
            {errorInfo.message}
          </p>

          {/* Error details in development */}
          {process.env.NODE_ENV === 'development' && error.digest && (
            <div className="rounded-md bg-muted p-3">
              <p className="text-xs font-mono text-muted-foreground">
                Error ID: {error.digest}
              </p>
            </div>
          )}

          {/* Recovery actions */}
          <div className="flex flex-col gap-3">
            {errorInfo.actions.map((action, index) => (
              <Button
                key={index}
                onClick={action.onClick}
                variant={action.variant}
                className="w-full"
              >
                {action.icon && <span className="mr-2">{action.icon}</span>}
                {action.label}
              </Button>
            ))}
          </div>

          {/* Support message for persistent errors */}
          {!isAuthError && !isNotFound && (
            <div className="mt-4 rounded-md border border-border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">
                If this problem persists, please contact support with the error details above.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
