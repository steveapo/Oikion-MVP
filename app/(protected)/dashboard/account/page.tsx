import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { getUserById } from "@/lib/user";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { SectionColumns } from "@/components/dashboard/section-columns";
import dynamic from "next/dynamic";
import { DeleteAccountSection } from "@/components/dashboard/delete-account";
const UserProfileForm = dynamic(() => import("@/components/forms/user-profile-form").then(m => m.UserProfileForm), {
  loading: () => <div className="h-40 rounded-lg border p-4"><div className="h-4 w-40 bg-muted animate-pulse rounded mb-3" /><div className="h-24 bg-muted animate-pulse rounded" /></div>,
  ssr: false,
});

const UserNameForm = dynamic(() => import("@/components/forms/user-name-form").then(m => m.UserNameForm), {
  loading: () => <div className="h-20 rounded-lg border p-4"><div className="h-4 w-32 bg-muted animate-pulse rounded" /></div>,
  ssr: false,
});

const ChangePasswordForm = dynamic(() => import("@/components/forms/change-password-form").then(m => m.ChangePasswordForm), {
  loading: () => <div className="h-32 rounded-lg border p-4"><div className="h-4 w-36 bg-muted animate-pulse rounded mb-3" /><div className="h-16 bg-muted animate-pulse rounded" /></div>,
  ssr: false,
});

export async function generateMetadata() {
  return constructMetadata({
    title: "Profile Settings – Oikion",
    description: "Manage your personal profile details and account settings.",
  });
}

export default async function AccountSettingsPage() {
  const user = await getCurrentUser();
  if (!user?.id) {
    redirect("/login");
  }

  const currentUser = user as NonNullable<typeof user>;
  const dbUser = await getUserById(currentUser.id!);
  const hasPassword = !!(dbUser as any)?.password;

  return (
    <>
      <DashboardHeader
        heading="Profile Settings"
        text="Manage your personal profile details and account settings."
      />
      <div className="grid gap-6 pb-10">
        <div className="divide-y divide-muted">
          <SectionColumns
            title="Profile Information"
            description="Update your personal details and profile information"
          >
            <UserProfileForm
              user={{
                id: currentUser.id!,
                email: (dbUser as any)?.email || (currentUser as any).email,
                image: (dbUser as any)?.image || (currentUser as any).image,
                username: (dbUser as any)?.username,
                usernameLastChangedAt: (dbUser as any)?.usernameLastChangedAt,
                usernameChangeCount: (dbUser as any)?.usernameChangeCount,
                onboardingCompletedAt: (dbUser as any)?.onboardingCompletedAt,
                firstName: (dbUser as any)?.firstName,
                lastName: (dbUser as any)?.lastName,
                phone: (dbUser as any)?.phone,
                company: (dbUser as any)?.company,
                description: (dbUser as any)?.description,
              }}
            />
          </SectionColumns>

          <UserNameForm user={{ id: currentUser.id!, name: currentUser.name }} />

          <SectionColumns
            title={hasPassword ? "Change Password" : "Set a Password"}
            description={hasPassword ? "Update your account password" : "Secure your account by setting a password"}
          >
            <ChangePasswordForm hasPassword={hasPassword} />
          </SectionColumns>

          <DeleteAccountSection />
        </div>
      </div>
    </>
  );
}


