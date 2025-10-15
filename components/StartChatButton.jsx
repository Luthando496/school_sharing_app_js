"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { createOrGetConversation } from "@/actions/chatActions";

export default function StartChatButton({ currentUser, targetUserId }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleStartChat = async () => {
    if (!currentUser || !targetUserId) {
      alert("User information is missing.");
      return;
    }

    setLoading(true);
    try {
      const result = await createOrGetConversation(currentUser.uid, targetUserId);
      if (result.conversationId) {
        router.push(`/chat/${result.conversationId}`);
      } else {
        throw new Error(result.error || "Failed to start chat.");
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Do not show the button if the user is viewing their own profile
  if (currentUser?.uid === targetUserId) {
    return null;
  }

  return (
    <button
      onClick={handleStartChat}
      disabled={loading}
      className="inline-flex items-center gap-2 bg-purple-600 text-white font-semibold py-2 px-6 rounded-full shadow-lg hover:bg-purple-700 transition-all duration-300 disabled:opacity-50"
    >
      <MessageCircle size={18} />
      {loading ? "Starting..." : "Message"}
    </button>
  );
}
