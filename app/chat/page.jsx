"use client";
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getUserConversations } from "@/actions/chatActions";
import Link from "next/link";
import { MessageSquare, User } from "lucide-react";
import { useRouter } from 'next/navigation';

export default function ChatListPage() {
  const [conversations, setConversations] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userConvos = await getUserConversations(user.uid);
        setConversations(userConvos);
      } else {
        // If no user, redirect to login
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <div className="text-center py-10">Loading conversations...</div>;
  }

  return (
    <div className="min-h-screen bg-primary py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold primary-text mb-6">Your Conversations</h1>
        <div className="card-bg rounded-xl shadow-lg">
          {conversations.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {conversations.map((convo) => {
                const otherParticipantName = convo.participantNames?.find(
                  (name) => name !== currentUser?.displayName
                );
                return (
                  <li key={convo.id}>
                    <Link href={`/chat/${convo.id}`} className="block p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="bg-purple-100 p-3 rounded-full">
                          <User className="text-purple-600" size={24} />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold primary-text">{otherParticipantName || "Chat"}</p>
                          <p className="text-sm secondary-text truncate">{convo.lastMessage}</p>
                        </div>
                        <span className="text-xs secondary-text">
                          {convo.lastMessageTimestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="mx-auto text-gray-400" size={48} />
              <p className="mt-4 secondary-text">You have no active conversations.</p>
              <Link href="/students" className="text-sm text-purple-600 hover:underline">
                Find a student to message.
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}