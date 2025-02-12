import { api } from "@/trpc/react";
import { PanelLeftOpen, SquarePen, Trash2 } from "lucide-react";
import { useConversation } from "@/app/_components/context/conversation-context";

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function ChatSidebar({ onToggle }: ChatSidebarProps) {
  const { activeConversationId, setActiveConversationId } = useConversation();
  const utils = api.useUtils();
  const { data: conversations } = api.conversation.getAll.useQuery();
  const { mutate: deleteConversation } = api.conversation.delete.useMutation({
    onSuccess: () => void utils.conversation.getAll.invalidate(),
  });

  const { mutate: createConversation } = api.conversation.create.useMutation({
    onSuccess: (newConversation) => {
      if (newConversation?.id) {
        setActiveConversationId(newConversation.id);
      }
      void utils.conversation.getAll.invalidate();
    },
  });

  const handleNewConversation = () => {
    createConversation({ name: "New Chat" });
  };

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Delete this conversation?")) {
      deleteConversation({ id });
      if (activeConversationId === id) {
        setActiveConversationId(null);
      }
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center justify-between p-4">
        <button onClick={onToggle} className="hover:text-gray-300">
          <PanelLeftOpen className="h-5 w-5" />
        </button>
        <button
          onClick={handleNewConversation}
          className="flex items-center gap-2 rounded-lg  px-3 py-2 hover:bg-gray-700"
        >
          <SquarePen className="h-5 w-5" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {conversations?.map((conversation) => (
          <div
            key={conversation.id}
            onClick={() => setActiveConversationId(conversation.id)}
            className={`group mb-2 flex cursor-pointer items-center justify-between rounded-lg p-3 ${
              activeConversationId === conversation.id 
                ? "bg-gray-700/50" 
                : "hover:bg-gray-700/30"
            }`}
          >
            <span className="line-clamp-1 text-sm">
              {conversation.name ?? "New Chat"}
            </span>
            <button
              onClick={(e) => handleDelete(conversation.id, e)}
              className="invisible text-gray-400 hover:text-gray-200 group-hover:visible"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 