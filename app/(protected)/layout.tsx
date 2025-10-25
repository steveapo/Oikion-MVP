import { redirect } from "@/i18n/navigation";

import { sidebarLinks } from "@/config/dashboard";
import { getCurrentUser } from "@/lib/session";
import { hasRole } from "@/lib/roles";
import { isEmailAuthRequiredForUserId } from "@/lib/email-auth";
import { SearchCommand } from "@/components/dashboard/search-command";
import {
  DashboardSidebar,
  MobileSheetSidebar,
} from "@/components/layout/dashboard-sidebar";
import { getCurrentOrganization, getUserOrganizations } from "@/actions/organizations";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { UserAccountNav } from "@/components/layout/user-account-nav";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import { SessionMonitor } from "@/components/auth/session-monitor";
import { CompleteProfileModal } from "@/components/modals/complete-profile-modal";
import { ProfileCompletionBanner } from "@/components/dashboard/profile-completion-banner";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default async function Dashboard({ children }: ProtectedLayoutProps) {
  const user = await getCurrentUser();
  // Prefetch organization data to avoid client-side POST calls; served with caching
  const [initialCurrentOrg, initialAllOrgs] = await Promise.all([
    getCurrentOrganization(),
    getUserOrganizations(),
  ]);

  if (!user) {
    redirect("/?error=session_invalid");
  }

  // At this point, user is guaranteed to exist
  const currentUser = user as NonNullable<typeof user>;

  // Enforce one-time email code verification (and periodic resets)
  const requiresEmailAuth = await isEmailAuthRequiredForUserId(currentUser.id!);
  if (requiresEmailAuth) {
    redirect("/email-verify");
  }

  const filteredLinks = sidebarLinks.map((section) => ({
    ...section,
    items: section.items.filter(({ authorizeOnly }) => {
      // If no authorization required, show to all
      if (!authorizeOnly) return true;
      
      // Check if user has sufficient role level (respects hierarchy)
      return hasRole(currentUser.role, authorizeOnly);
    }),
  }));

  // Check if profile is incomplete (always false for now)
  const isProfileIncomplete = false;

  return (
    <div className="relative flex min-h-screen w-full">
      <SessionMonitor />
      
      {/* Show complete profile modal for existing users without onboarding */}
      {isProfileIncomplete && (
        <CompleteProfileModal userName={currentUser.name || undefined} />
      )}
      
      <DashboardSidebar links={filteredLinks} initialCurrentOrg={initialCurrentOrg} initialAllOrgs={initialAllOrgs as any} />

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-50 flex h-14 bg-background px-4 lg:h-[60px] xl:px-8">
          <MaxWidthWrapper className="flex max-w-7xl items-center gap-x-3 px-0">
            <MobileSheetSidebar links={filteredLinks} initialCurrentOrg={initialCurrentOrg} initialAllOrgs={initialAllOrgs as any} />

            <div className="w-full flex-1">
              <SearchCommand links={filteredLinks} />
            </div>

            <ModeToggle />
            <UserAccountNav user={currentUser} />
          </MaxWidthWrapper>
        </header>

        {/* Show banner if profile is incomplete */}
        {isProfileIncomplete && <ProfileCompletionBanner />}

        <main className="flex-1 p-4 xl:px-8">
          <MaxWidthWrapper className="flex h-full max-w-7xl flex-col gap-4 px-0 lg:gap-6">
            {children}
          </MaxWidthWrapper>
        </main>
      </div>
    </div>
  );
}
