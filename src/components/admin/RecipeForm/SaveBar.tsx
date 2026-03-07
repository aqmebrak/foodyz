import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface SaveBarProps {
  isPending: boolean;
  isEdit: boolean;
}

export function SaveBar({ isPending, isEdit }: SaveBarProps) {
  return (
    <div className="flex items-center gap-3 justify-end pt-2">
      <Button type="submit" disabled={isPending} className="min-w-28">
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving…
          </>
        ) : isEdit ? (
          "Save changes"
        ) : (
          "Create recipe"
        )}
      </Button>
    </div>
  );
}
