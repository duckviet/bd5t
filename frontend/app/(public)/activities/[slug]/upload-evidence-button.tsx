"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UploadEvidenceDialog } from "@/components/evidence/upload-evidence-dialog";

interface UploadEvidenceButtonProps {
  activityId?: string;
}

export function UploadEvidenceButton({ activityId }: UploadEvidenceButtonProps) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="lg"
        className="w-full gap-2 mt-4"
        onClick={() => setIsUploadOpen(true)}
      >
        Nộp minh chứng
      </Button>
      <UploadEvidenceDialog
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        initialActivityId={activityId}
      />
    </>
  );
}
