import { redirect } from "@/i18n/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icons } from "@/components/shared/icons";

interface AcceptInvitePageProps {
  searchParams: {
    token?: string;
  };
}

export default async function AcceptInvitePage({
  searchParams,
}: AcceptInvitePageProps) {
  const session = await auth();
  const token = searchParams.token;

  if (!token) {
    return (
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.warning className="size-5 text-destructive" />
              Invalid Invitation
            </CardTitle>
            <CardDescription>
              This invitation link is invalid or incomplete.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Find the invitation
  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: {
      organization: true,
      inviter: { select: { name: true, email: true } },
    },
  });

  if (!invitation) {
    return (
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.warning className="size-5 text-destructive" />
              Invitation Not Found
            </CardTitle>
            <CardDescription>
              This invitation doesn't exist or has been deleted.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Check if expired
  if (invitation.expiresAt < new Date()) {
    return (
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.warning className="size-5 text-destructive" />
              Invitation Expired
            </CardTitle>
            <CardDescription>
              This invitation has expired. Please contact the organization owner for a new invitation.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Check if already accepted
  if (invitation.status !== "PENDING") {
    return (
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.check className="size-5 text-green-600" />
              Invitation Already {invitation.status}
            </CardTitle>
            <CardDescription>
              This invitation has already been {invitation.status.toLowerCase()}.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // If user is signed in, accept the invitation
  if (session?.user?.id) {
    // Check if email matches
    if (session.user.email?.toLowerCase() !== invitation.email.toLowerCase()) {
      return (
        <div className="container flex h-screen w-screen flex-col items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.warning className="size-5 text-destructive" />
                Email Mismatch
              </CardTitle>
              <CardDescription>
                This invitation is for <strong>{invitation.email}</strong>, but you're signed in as <strong>{session.user.email}</strong>.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Please sign out and sign in with {invitation.email}, or request a new invitation for your current email.
              </p>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Link href="/api/auth/signout">
                <Button variant="outline">Sign Out</Button>
              </Link>
              <Link href="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      );
    }

    // Accept the invitation
    try {
      // Create organization membership
      await prisma.organizationMember.create({
        data: {
          userId: session.user.id,
          organizationId: invitation.organizationId,
          role: invitation.role,
        },
      });

      // Switch user to the invited organization
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          organizationId: invitation.organizationId,
          role: invitation.role,
        },
      });

      // Mark invitation as accepted
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: "ACCEPTED" },
      });

      // Log activity
      await prisma.activity.create({
        data: {
          actionType: "MEMBER_INVITED",
          entityType: "USER",
          entityId: session.user.id,
          payload: { email: invitation.email, role: invitation.role },
          organizationId: invitation.organizationId,
          actorId: session.user.id,
        },
      });

      // Redirect to dashboard with success message
      redirect("/dashboard?invitation=accepted");
    } catch (error) {
      console.error("Failed to accept invitation:", error);
      
      return (
        <div className="container flex h-screen w-screen flex-col items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.warning className="size-5 text-destructive" />
                Failed to Accept Invitation
            </CardTitle>
              <CardDescription>
                An error occurred while accepting the invitation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : "Please try again or contact support."}
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      );
    }
  }

  // User is not signed in - redirect to register with token
  redirect(`/register?email=${encodeURIComponent(invitation.email)}&token=${token}`);
}
