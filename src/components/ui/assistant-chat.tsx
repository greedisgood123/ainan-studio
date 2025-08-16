import { MessageCircle } from "lucide-react";

type AssistantChatProps = {
  floating?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function AssistantChat({ floating = true, open: externalOpen, onOpenChange }: AssistantChatProps) {
  // TODO: Implement chat functionality with local backend
  // For now, this component is temporarily disabled during migration
  
  // Return null to hide the component temporarily
  return null;
}