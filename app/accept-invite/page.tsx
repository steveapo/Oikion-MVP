"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getInvitationByToken, acceptInvitation } from "@/actions/accept-invitation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, CheckCircle2, XCircle, Building2 } from "lucide-react";
import { getRoleDisplayName } from "@/lib/roles";
import Link from "next/link";

export default function AcceptInvitePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const token = searchParams?.get("token");

  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid invitation link");
      setLoading(false);
      return;
    }

    // Fetch invitation details
    const fetchInvitation = async () => {
      try {
        const result = await getInvitationByToken(token);
        
        if (result.error) {
          setError(result.error);
        } else if (result.invitation) {
          setInvitation(result.invitation);
        }
      } catch (err) {
        setError("Failed to load invitation");
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [token]);

  useEffect(() => {
    // Auto-accept if user is already signed in and invitation is valid
    if (session && invitation && !accepting && !success && !error) {
      handleAccept();
    }
  }, [session, invitation]);

  const handleAccept = async () => {
    if (!token) return;

    setAccepting(true);
    setError(null);

    try {
      const result = await acceptInvitation(token);
      
      if (result.success) {
        setSuccess(true);
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 2000);
      } else if (result.requiresAuth) {
        // Redirect to login with return URL
        router.push(`/login?callbackUrl=/accept-invite?token=${token}`);
      } else {
        setError(result.error || "Failed to accept invitation");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">Loading invitation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Invalid Invitation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button asChild className="w-full">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              Invitation Accepted!
            </CardTitle>
            <CardDescription>
              You've successfully joined the organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Building2 className="h-4 w-4" />
              <AlertDescription>
                Redirecting you to the dashboard...
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation) {
    return null;
  }

  return (
    <div className="container flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            You're Invited!
          </CardTitle>
          <CardDescription>
            Join {invitation.organization.name} on Oikion
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Organization</span>
              <span className="font-medium">{invitation.organization.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Your Role</span>
              <span className="font-medium">{getRoleDisplayName(invitation.role)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Invited By</span>
              <span className="font-medium">
                {invitation.inviter.name || invitation.inviter.email}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="font-medium">{invitation.email}</span>
            </div>
          </div>

          {status === "unauthenticated" ? (
            <div className="space-y-2">
              <Alert>
                <AlertDescription>
                  Please sign in with <strong>{invitation.email}</strong> to accept this invitation.
                </AlertDescription>
              </Alert>
              <Button asChild className="w-full">
                <Link href={`/login?callbackUrl=/accept-invite?token=${token}`}>
                  Sign In to Accept
                </Link>
              </Button>
            </div>
          ) : accepting ? (
            <Button disabled className="w-full">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Accepting Invitation...
            </Button>
          ) : (
            <Button onClick={handleAccept} className="w-full">
              Accept Invitation
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
