"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

interface ConfirmationDialogProps {
  title: string;
  description: string;
  warningText?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  children: React.ReactNode;
  variant?: "destructive" | "default";
}

export function ConfirmationDialog({
  title,
  description,
  warningText,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  children,
  variant = "destructive",
}: ConfirmationDialogProps) {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <div onClick={() => setOpen(true)}>{children}</div>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="space-y-4">
          <div className="flex items-start gap-4">
            {variant === "destructive" && (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            )}
            <div className="flex-1 space-y-3">
              <div>
                <DialogTitle className="text-lg">{title}</DialogTitle>
                <DialogDescription className="mt-2 text-sm text-muted-foreground">{description}</DialogDescription>
              </div>
              {warningText && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm font-medium text-red-800">{warningText}</p>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="gap-3 sm:gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="flex-1 sm:flex-none"
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={handleConfirm}
            className="flex-1 sm:flex-none"
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
