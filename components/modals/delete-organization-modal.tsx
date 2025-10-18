import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { deleteOrganization } from "@/actions/organizations";
import { getUserOrganizations, getCurrentOrganization } from "@/actions/organizations";

function DeleteOrganizationModal({
  showDeleteOrganizationModal,
  setShowDeleteOrganizationModal,
}: {
  showDeleteOrganizationModal: boolean;
  setShowDeleteOrganizationModal: Dispatch<SetStateAction<boolean>>;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [deleting, setDeleting] = useState(false);

  async function handleDeleteOrganization() {
    setDeleting(true);
    toast.loading("Deleting organization...", { id: "org-delete" });

    try {
      const result = await deleteOrganization();

      if (result.success) {
        toast.success("Organization deleted successfully", { id: "org-delete" });
        
        // Close the modal
        setShowDeleteOrganizationModal(false);
        
        // Wait a moment for the backend to update
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        // Navigate to dashboard (will be in personal workspace)
        router.push("/dashboard");
        router.refresh();
        
        // Force reload to ensure all state is fresh
        window.location.href = "/dashboard";
      } else {
        toast.error(result.error || "Failed to delete organization", { id: "org-delete" });
        setDeleting(false);
      }
    } catch (error) {
      toast.error("Failed to delete organization", { id: "org-delete" });
      setDeleting(false);
    }
  }

  return (
    <Modal
      showModal={showDeleteOrganizationModal}
      setShowModal={setShowDeleteOrganizationModal}
      className="gap-0"
    >
      <div className="flex flex-col space-y-3 border-b p-4 pt-8 sm:px-16">
        <h3 className="text-lg font-semibold">Delete Organization</h3>
        <p className="text-sm text-muted-foreground">
          <b>Warning:</b> This will permanently delete your organization and all
          related data (properties, clients, tasks, interactions, activities).
          This action cannot be undone.
        </p>
      </div>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await handleDeleteOrganization();
        }}
        className="flex flex-col space-y-6 bg-accent px-4 py-8 text-left sm:px-16"
      >
        <div>
          <label htmlFor="verification" className="block text-sm">
            To verify, type {" "}
            <span className="font-semibold text-black dark:text-white">
              confirm delete organization
            </span>{" "}
            below
          </label>
          <Input
            type="text"
            name="verification"
            id="verification"
            pattern="confirm delete organization"
            required
            autoFocus={false}
            autoComplete="off"
            className="mt-1 w-full border bg-background"
          />
        </div>

        <Button variant={deleting ? "disable" : "destructive"} disabled={deleting}>
          Confirm delete organization
        </Button>
      </form>
    </Modal>
  );
}

export function useDeleteOrganizationModal() {
  const [showDeleteOrganizationModal, setShowDeleteOrganizationModal] = useState(false);

  const DeleteOrganizationModalCallback = useCallback(() => {
    return (
      <DeleteOrganizationModal
        showDeleteOrganizationModal={showDeleteOrganizationModal}
        setShowDeleteOrganizationModal={setShowDeleteOrganizationModal}
      />
    );
  }, [showDeleteOrganizationModal, setShowDeleteOrganizationModal]);

  return useMemo(
    () => ({
      setShowDeleteOrganizationModal,
      DeleteOrganizationModal: DeleteOrganizationModalCallback,
    }),
    [setShowDeleteOrganizationModal, DeleteOrganizationModalCallback],
  );
}
