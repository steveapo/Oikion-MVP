"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/shared/icons";

export default function PasswordGatePage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      setError("Please enter a password");
      return;
    }
    
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Incorrect password. Please try again.");
        setPassword("");
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (data.success) {
        // Redirect to the page they were trying to access or home
        const urlParams = new URLSearchParams(window.location.search);
        const returnUrl = urlParams.get("returnUrl") || "/";
        window.location.href = returnUrl;
      } else {
        setError("Incorrect password. Please try again.");
        setPassword("");
        setLoading(false);
      }
    } catch (err) {
      console.error("Password verification error:", err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg border bg-card p-6 shadow-lg sm:p-8">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Icons.logo className="size-12" />
          <h1 className="text-2xl font-bold">Password Protected</h1>
          <p className="text-sm text-muted-foreground">
            This application is currently password protected. Please enter the password to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoFocus
              className="w-full"
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Icons.spinner className="mr-2 size-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Access is restricted to authorized users only.
        </p>
      </div>
    </div>
  );
}
