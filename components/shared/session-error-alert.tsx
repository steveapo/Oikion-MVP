"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export function SessionErrorAlert() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const error = searchParams?.get("error");
    if (error === "session_invalid") {
      setShow(true);
      // Clear the session cookies
      signOut({ redirect: false });
    }
  }, [searchParams]);

  if (!show) return null;

  const handleDismiss = () => {
    setShow(false);
    const url = new URL(window.location.href);
    url.searchParams.delete("error");
    router.replace(url.pathname);
  };

  const handleRegister = () => {
    router.push("/register");
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm" />
      
      {/* Alert container */}
      <div className="fixed top-1/2 left-1/2 z-[9999] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 px-4">
        <Alert variant="destructive" className="border-2 shadow-2xl bg-background">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-lg font-semibold">
            Critical Authentication Error
          </AlertTitle>
          <AlertDescription className="mt-2 space-y-3">
            <p>
              We detected an invalid session. Your account data could not be found
              in our system, which may have occurred due to a database
              synchronization issue.
            </p>
            <p className="text-sm">
              We apologize for this inconvenience. Please register a new account
              to continue.
            </p>
            <div className="mt-4 flex gap-3">
              <Button onClick={handleRegister} size="sm">
                Register New Account
              </Button>
              <Button onClick={handleDismiss} variant="outline" size="sm">
                Dismiss
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </>
  );
}
