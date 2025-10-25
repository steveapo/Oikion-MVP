"use client";

import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { SectionColumns } from "@/components/dashboard/section-columns";
import { useDeleteAccountModal } from "@/components/modals/delete-account-modal";
import { Icons } from "@/components/shared/icons";

export function DeleteAccountSection() {
  const { setShowDeleteAccountModal, DeleteAccountModal } =
    useDeleteAccountModal();

  const userPaidPlan = true;

  return (
    <>
      <DeleteAccountModal />
      <SectionColumns
        title="Delete Account"
        description="Permanently delete your account and all associated data"
      >
        <div className="flex flex-col gap-4 rounded-xl border border-red-400 p-4 dark:border-red-900">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-medium">Confirm account deletion</span>

              {userPaidPlan ? (
                <div className="flex items-center gap-1 rounded-md bg-red-600/10 p-1 pr-2 text-xs font-medium text-red-600 dark:bg-red-500/10 dark:text-red-500">
                  <div className="m-0.5 rounded-full bg-red-600 p-[3px]">
                    <Icons.close size={10} className="text-background" />
                  </div>
                  Active Subscription
                </div>
              ) : null}
            </div>
            <div className="text-balance text-sm text-muted-foreground">
              This will permanently delete your {siteConfig.name} account{userPaidPlan ? " and cancel your subscription" : ""}. All your data will be lost and cannot be recovered.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="submit"
              variant="destructive"
              onClick={() => setShowDeleteAccountModal(true)}
            >
              <Icons.trash className="mr-2 size-4" />
              <span>Delete Account</span>
            </Button>
          </div>
        </div>
      </SectionColumns>
    </>
  );
}
