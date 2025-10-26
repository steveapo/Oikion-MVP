"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Building2, Check, ChevronsUpDown, Plus, Users } from "lucide-react";
import { useSession } from "next-auth/react";

import { getCurrentOrganization, getUserOrganizations, switchOrganization, createOrganization } from "@/actions/organizations";
import { cn } from "@/lib/utils";
import { useOrganizationContext } from "@/lib/organization-context";
import { subscribeToLiveUpdates } from "@/lib/live-updates";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type OrganizationType = {
  id: string;
  name: string;
  isPersonal?: boolean;
  _count?: {
    users: number;
  };
};

export default function ProjectSwitcher({
  large = false,
  initialCurrentOrg,
  initialAllOrgs,
}: {
  large?: boolean;
  initialCurrentOrg?: OrganizationType | null;
  initialAllOrgs?: OrganizationType[];
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { eventCounter, triggerReload } = useOrganizationContext();
  const [openPopover, setOpenPopover] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [currentOrg, setCurrentAgency] = useState<OrganizationType | null>(initialCurrentOrg || null);
  const [allOrgs, setAllAgencies] = useState<OrganizationType[]>(initialAllOrgs || []);
  const [loading, setLoading] = useState(!initialCurrentOrg);
  const [creating, setCreating] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [newOrgName, setNewAgencyName] = useState("");
  const hasLoadedOnce = useRef(Boolean(initialCurrentOrg) || (initialAllOrgs && initialAllOrgs.length > 0));

  // Only load organizations on initial mount or when eventCounter changes
  // This prevents unnecessary reloads on window focus/tab changes
  useEffect(() => {
    async function loadOrganizations() {
      setLoading(true);
      if (status === "authenticated" && (session?.user as any)?.organizationId) {
        const [current, all] = await Promise.all([
          getCurrentOrganization(),
          getUserOrganizations(),
        ]);
        
        if (current) {
          setCurrentAgency({ 
            id: current.id, 
            name: current.name,
            isPersonal: (current as any).isPersonal,
          });
        }
        setAllAgencies(all as OrganizationType[]);
        hasLoadedOnce.current = true;
      }
      setLoading(false);
    }

    // Only load if:
    // 1. Never loaded before (initial mount)
    // 2. eventCounter changed (org switch, create, update, delete)
    // 3. Status changed to authenticated (user just logged in)
    if (!hasLoadedOnce.current || eventCounter > 0) {
      loadOrganizations();
    }
    // Note: session?.user is intentionally NOT in dependencies to prevent
    // unnecessary reloads on window focus (when SessionProvider refetches)
    // We only reload when actual org operations occur (tracked by eventCounter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, eventCounter]);

  // Subscribe to member removal events to update org list when user is kicked
  useEffect(() => {
    if (!session?.user?.id || !session?.user?.organizationId) return;

    console.log('[ProjectSwitcher] Subscribing to member events');

    const unsubscribe = subscribeToLiveUpdates(
      "member",
      session.user.organizationId,
      (event) => {
        console.log('[ProjectSwitcher] Received member event:', event);
        
        // If the current user was removed, refresh the org list
        if (
          event.action === "removed" && 
          event.metadata?.userId === session.user.id
        ) {
          console.log('[ProjectSwitcher] Current user was removed, reloading orgs');
          
          // Trigger a reload of organizations
          triggerReload("update");
          
          // Also refresh the router to update session
          router.refresh();
        }
      }
    );

    return () => {
      console.log('[ProjectSwitcher] Unsubscribing from member events');
      unsubscribe();
    };
  }, [session?.user?.id, session?.user?.organizationId, triggerReload, router]);

  const handleSwitchOrg = async (agencyId: string) => {
    if (agencyId === currentOrg?.id) return;
    
    setSwitching(true);
    setOpenPopover(false);
    const result = await switchOrganization(agencyId);
    
    if (result.success) {
      toast.success("Switched agency");
      // Trigger reload via context
      triggerReload("switch");
      setSwitching(false);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to switch agency");
      setSwitching(false);
    }
  };

  const handleCreateOrg = async () => {
    if (!newOrgName.trim()) {
      toast.error("Agency name is required");
      return;
    }

    setCreating(true);
    toast.loading("Creating agency...", { id: "org-create" });
    
    const result = await createOrganization({ name: newOrgName, isPersonal: false });

    if (result.success && result.organizationId) {
      // Switch to the new organization
      const switchResult = await switchOrganization(result.organizationId);
      
      if (switchResult.success) {
        toast.success("Agency created successfully", { id: "org-create" });
        setNewAgencyName("");
        setOpenCreateDialog(false);
        
        // Trigger reload via context
        triggerReload("create");
        
        // Navigate to dashboard of new organization
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.error("Agency created but failed to switch to it", { id: "org-create" });
      }
    } else {
      toast.error(result.error || "Failed to create agency", { id: "org-create" });
    }
    setCreating(false);
  };

  // Always show skeleton while loading or switching
  if (loading || status === "loading" || switching) {
    return <ProjectSwitcherPlaceholder />;
  }

  // Show skeleton instead of fallback text if no org yet
  if (!currentOrg) {
    return <ProjectSwitcherPlaceholder />;
  }

  return (
    <>
      <div>
        <Popover open={openPopover} onOpenChange={setOpenPopover}>
          <PopoverTrigger>
            <Button
              className="h-8 px-2"
              variant={openPopover ? "secondary" : "ghost"}
              onClick={() => setOpenPopover(!openPopover)}
              disabled={switching}
            >
              <div className="flex items-center space-x-3 pr-2">
                {currentOrg.isPersonal ? (
                  <Building2 className="size-4 shrink-0 text-muted-foreground" />
                ) : (
                  <Users className="size-4 shrink-0 text-muted-foreground" />
                )}
                <div className="flex items-center space-x-3">
                  <span
                    className={cn(
                      "inline-block truncate text-sm font-medium xl:max-w-[120px]",
                      large ? "w-full" : "max-w-[80px]",
                    )}
                  >
                    {currentOrg.name}
                  </span>
                </div>
              </div>
              <ChevronsUpDown
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[280px] p-2">
            <OrganizationList
              currentOrg={currentOrg}
              allOrgs={allOrgs}
              onSwitch={handleSwitchOrg}
              onCreateNew={() => {
                setOpenPopover(false);
                setOpenCreateDialog(true);
              }}
              switching={switching}
            />
          </PopoverContent>
        </Popover>
      </div>

      <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Agency</DialogTitle>
            <DialogDescription>
              Create a new agency to manage properties and clients separately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="agency-name">Agency Name</Label>
              <Input
                id="agency-name"
                placeholder="My Real Estate Agency"
                value={newOrgName}
                onChange={(e) => setNewAgencyName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateOrg();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenCreateDialog(false)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateOrg} disabled={creating}>
              {creating ? "Creating..." : "Create Agency"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function OrganizationList({
  currentOrg,
  allOrgs,
  onSwitch,
  onCreateNew,
  switching,
}: {
  currentOrg: OrganizationType;
  allOrgs: OrganizationType[];
  onSwitch: (agencyId: string) => void;
  onCreateNew: () => void;
  switching: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      {/* Organization List */}
      <div className="mb-1">
        <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
          Organizations
        </p>
      </div>
      
      {allOrgs.map((org) => (
        <button
          key={org.id}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "relative flex h-9 w-full items-center gap-3 p-3 text-left",
            currentOrg.id === org.id
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
          onClick={() => onSwitch(org.id)}
          disabled={switching || currentOrg.id === org.id}
        >
          {org.isPersonal ? (
            <Building2 className="size-4 shrink-0" />
          ) : (
            <Users className="size-4 shrink-0" />
          )}
          <div className="flex-1 truncate">
            <span className="text-sm font-medium">{org.name}</span>
            {org._count && org._count.users > 1 && (
              <span className="ml-2 text-xs text-muted-foreground">
                {org._count.users} members
              </span>
            )}
          </div>
          {currentOrg.id === org.id && (
            <Check size={16} className="shrink-0" aria-hidden="true" />
          )}
        </button>
      ))}

      {/* Create New Organization */}
      <div className="border-t pt-1">
        <Button
          variant="ghost"
          className="relative flex h-9 w-full items-center justify-start gap-2 p-3"
          onClick={onCreateNew}
        >
          <Plus size={16} />
          <span className="flex-1 truncate text-left text-sm">New Organization</span>
        </Button>
      </div>
    </div>
  );
}

function ProjectSwitcherPlaceholder() {
  return (
    <div className="flex animate-pulse items-center space-x-1.5 rounded-lg px-1.5 py-2 sm:w-60">
      <div className="h-8 w-36 animate-pulse rounded-md bg-muted xl:w-[180px]" />
    </div>
  );
}
