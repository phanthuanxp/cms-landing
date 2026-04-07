"use client";

import { type MouseEvent } from "react";

import { Button, type ButtonProps } from "@/components/ui/button";

type ConfirmSubmitButtonProps = ButtonProps & {
  confirmationMessage?: string;
};

export function ConfirmSubmitButton({
  confirmationMessage = "Ban co chac chan muon xoa muc nay khong?",
  onClick,
  ...props
}: ConfirmSubmitButtonProps) {
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (!window.confirm(confirmationMessage)) {
      event.preventDefault();
      return;
    }

    onClick?.(event);
  }

  return <Button onClick={handleClick} type="submit" {...props} />;
}
