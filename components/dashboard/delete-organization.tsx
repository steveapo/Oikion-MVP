"use client";

import { useState } from "react";
import { UserRole } from "@prisma/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SectionColumns } from "@/components/dashboard/section-columns";
import { Icons } from "@/components/shared/icons";
import { useDeleteOrganizationModal } from "@/components/modals/delete-organization-modal";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteOrganizationSectionProps {
  isPersonalOrg?: boolean;
}

export function DeleteOrganizationSection({ isPersonalOrg = false }: DeleteOrganizationSectionProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [showPersonalOrgDialog, setShowPersonalOrgDialog] = useState(false);
  const { setShowDeleteOrganizationModal, DeleteOrganizationModal } =
    useDeleteOrganizationModal();
  const role = session?.user?.role;
  // Only ORG_OWNER can delete the organization
  const allowed = role === UserRole.ORG_OWNER;

  // Don't show if not allowed
  if (!allowed) return null;

  return (
    <>
      <DeleteOrganizationModal />
      
      {/* Personal Organization Dialog */}
      <Dialog open={showPersonalOrgDialog} onOpenChange={setShowPersonalOrgDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("deleteOrganization.personalOrg.title")}</DialogTitle>
            <DialogDescription className="pt-2">
              {t("deleteOrganization.personalOrg.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-4">
            <p className="text-sm text-muted-foreground">
              {t("deleteOrganization.personalOrg.explanation")}
            </p>
          </div>
          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPersonalOrgDialog(false)}
            >
              {t("deleteOrganization.personalOrg.understand")}
            </Button>
            <Button
              type="button"
              onClick={() => {
                setShowPersonalOrgDialog(false);
                router.push('/dashboard/settings');
                // TODO: Open create organization modal/flow
              }}
            >
              {t("deleteOrganization.personalOrg.createNew")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <SectionColumns
        title={t("deleteOrganization.title")}
        description={t("deleteOrganization.description")}
      >
        <div className="relative">
          {/* Blurred content for personal org */}
          <div className={`flex flex-col gap-4 rounded-xl border p-4 ${
            isPersonalOrg 
              ? 'border-muted blur-sm select-none pointer-events-none dark:border-muted' 
              : 'border-red-400 dark:border-red-900'
          }`}>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-medium">{t("deleteOrganization.confirm")}</span>
              </div>
              <div className="text-balance text-sm text-muted-foreground">
                {t("deleteOrganization.warning")}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="destructive"
                disabled={isPersonalOrg}
              >
                <Icons.trash className="mr-2 size-4" />
                <span>{t("deleteOrganization.button")}</span>
              </Button>
            </div>
          </div>
          
          {/* Overlay for personal org */}
          {isPersonalOrg && (
            <div 
              className="absolute inset-0 flex items-center justify-center cursor-pointer rounded-xl bg-background/80 backdrop-blur-[1px]"
              onClick={() => setShowPersonalOrgDialog(true)}
            >
              <div className="text-center space-y-2 px-4">
                <Icons.help className="mx-auto size-8 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">
                  {t("deleteOrganization.personalOrg.badge")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("deleteOrganization.personalOrg.clickToLearn")}
                </p>
              </div>
            </div>
          )}
          
          {/* Regular delete button for non-personal orgs */}
          {!isPersonalOrg && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl">
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteOrganizationModal(true)}
                className="relative z-10"
              >
                <Icons.trash className="mr-2 size-4" />
                <span>{t("deleteOrganization.button")}</span>
              </Button>
            </div>
          )}
        </div>
      </SectionColumns>
    </>
  );
}
