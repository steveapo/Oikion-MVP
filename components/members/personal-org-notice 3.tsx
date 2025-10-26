"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createOrganization } from "@/actions/organizations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/shared/icons";

export function PersonalOrgNotice() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Organization name is required");
      return;
    }
    setCreating(true);
    const res = await createOrganization({ name, isPersonal: false });
    setCreating(false);
    if (!res.success) {
      toast.error(res.error || "Failed to create organization");
      return;
    }
    toast.success("Organization created");
    setOpen(false);
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <>
      <Card className="border-amber-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.warning className="size-5 text-amber-600" />
            Personal Workspace
          </CardTitle>
          <CardDescription>
            The Personal Workspace is reserved for you only. To invite others, create a new organization.
          </CardDescription>
        </CardHeader>
        <CardContent />
        <CardFooter>
          <Button onClick={() => setOpen(true)}>Create Organization</Button>
        </CardFooter>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Organization</DialogTitle>
            <DialogDescription>Enter a name for your new organization.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Input placeholder="Organization name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={creating}>Cancel</Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? <><Icons.spinner className="mr-2 size-4 animate-spin" />Creating...</> : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}


