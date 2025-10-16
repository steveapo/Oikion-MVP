import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

function DeleteOrganizationModal({
  showDeleteOrganizationModal,
  setShowDeleteOrganizationModal,
}: {
  showDeleteOrganizationModal: boolean;
  setShowDeleteOrganizationModal: Dispatch<SetStateAction<boolean>>;
}) {
  const { data: session } = useSession();
  const [deleting, setDeleting] = useState(false);

  async function deleteOrganization() {
    setDeleting(true);
    await fetch(`/api/organization`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    }).then(async (res) => {
      if (res.status === 200) {
        // Brief delay to allow revalidation/navigation
        await new Promise((resolve) => setTimeout(resolve, 400));
        // Reload to reflect new org-less state
        window.location.assign("/dashboard");
      } else {
        setDeleting(false);
        const error = await res.text();
        throw error;
      }
    });
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
          toast.promise(deleteOrganization(), {
            loading: "Deleting organization...",
            success: "Organization deleted successfully!",
            error: (err) => err,
          });
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
