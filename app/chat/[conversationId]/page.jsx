"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { db } from "@/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { Send, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ChatPage() {
  const { conversationId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [conversationInfo, setConversationInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Effect to get the current logged-in user
  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false); // Stop loading once user status is determined
    });
    return () => unsubscribeAuth();
  }, []);

  // Effect to fetch conversation details AND mark messages as read
  useEffect(() => {
    if (!conversationId || !currentUser) return;

    const conversationRef = doc(db, "conversations", conversationId);

    const fetchAndRead = async () => {
      // Fetch conversation details
      const docSnap = await getDoc(conversationRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const otherParticipantName = data.participantNames?.find(
          (name) => name !== currentUser.displayName
        );
        setConversationInfo({
          ...data,
          otherParticipantName: otherParticipantName || 'Chat',
        });
      }
      
      // Mark messages as read for the current user
      await updateDoc(conversationRef, {
        [`unreadCounts.${currentUser.uid}`]: 0,
      });
    };

    fetchAndRead();
  }, [conversationId, currentUser]);

  // Effect to listen for new messages in real-time
  useEffect(() => {
    if (!conversationId) return;
    const messagesRef = collection(db, "conversations", conversationId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));
    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribeMessages();
  }, [conversationId]);
  
  // Effect to auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === "" || !currentUser) return;

    const conversationRef = doc(db, "conversations", conversationId);
    
    try {
      // Add the new message
      const messagesRef = collection(db, "conversations", conversationId, "messages");
      await addDoc(messagesRef, {
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.email,
        text: newMessage,
        timestamp: serverTimestamp(),
      });

      // Update last message and increment unread count for the other user
      const convoDoc = await getDoc(conversationRef);
      if (convoDoc.exists()) {
        const otherUserId = convoDoc.data().participants.find(id => id !== currentUser.uid);
        if (otherUserId) {
            const currentUnreadCount = convoDoc.data().unreadCounts?.[otherUserId] || 0;
            await updateDoc(conversationRef, {
                lastMessage: newMessage,
                lastMessageTimestamp: serverTimestamp(),
                [`unreadCounts.${otherUserId}`]: currentUnreadCount + 1,
            });
        }
      }
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  
  if (loading) {
      return <div className="flex h-[calc(100vh-150px)] items-center justify-center"><p>Loading chat...</p></div>
  }

  return (
    <div className="flex flex-col h-[calc(100vh-150px)] max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
        {/* Chat Header */}
        <div className="flex items-center p-4 border-b bg-gray-50 rounded-t-lg">
            <Link href="/chat" className="p-2 rounded-full hover:bg-gray-200">
                <ArrowLeft size={20} />
            </Link>
            <h2 className="text-lg font-semibold ml-4">{conversationInfo?.otherParticipantName || 'Loading...'}</h2>
        </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-end gap-2 ${msg.senderId === currentUser?.uid ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl ${
                msg.senderId === currentUser?.uid
                  ? "bg-purple-600 text-white rounded-br-none"
                  : "bg-gray-200 text-gray-800 rounded-bl-none"
              }`}
            >
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 bg-gray-50 border-t rounded-b-lg">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            className="p-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:opacity-50 transition-colors"
            disabled={!newMessage.trim()}
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}