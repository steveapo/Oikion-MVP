"use client";

import { canAccessAdmin } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { SectionColumns } from "@/components/dashboard/section-columns";
import { Icons } from "@/components/shared/icons";
import { useDeleteOrganizationModal } from "@/components/modals/delete-organization-modal";
import { useSession } from "next-auth/react";

export function DeleteOrganizationSection() {
  const { data: session } = useSession();
  const { setShowDeleteOrganizationModal, DeleteOrganizationModal } =
    useDeleteOrganizationModal();

  const role = session?.user?.role;
  const allowed = role ? canAccessAdmin(role) : false;

  if (!allowed) return null;

  return (
    <>
      <DeleteOrganizationModal />
      <SectionColumns
        title="Delete Organization"
        description="This is a danger zone – deleting your org will remove all its data."
      >
        <div className="flex flex-col gap-4 rounded-xl border border-red-400 p-4 dark:border-red-900">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-medium">Are you sure?</span>
            </div>
            <div className="text-balance text-sm text-muted-foreground">
              Permanently delete your organization and all associated data.
              This action cannot be undone.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="destructive"
              onClick={() => setShowDeleteOrganizationModal(true)}
            >
              <Icons.trash className="mr-2 size-4" />
              <span>Delete Organization</span>
            </Button>
          </div>
        </div>
      </SectionColumns>
    </>
  );
}
