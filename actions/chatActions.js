"use server";
import { db } from "@/firebase";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";
import { revalidatePath } from "next/cache";





/**
 * Creates a new conversation document in Firestore if one doesn't already exist
 * between two users.
 * @param {string} user1Id - The ID of the first user.
 * @param {string} user2Id - The ID of the second user.
 * @returns {object} An object containing the conversationId or an error.
 */


export async function createOrGetConversation(user1Id, user2Id) {
  const conversationId = [user1Id, user2Id].sort().join("_");
  const conversationRef = doc(db, "conversations", conversationId);

  try {
    const docSnap = await getDoc(conversationRef);

    if (!docSnap.exists()) {
      const user1Doc = await getDoc(doc(db, "students", user1Id));
      const user2Doc = await getDoc(doc(db, "students", user2Id));
      const user1Name = user1Doc.data()?.studentName || "User 1";
      const user2Name = user2Doc.data()?.studentName || "User 2";

      await setDoc(conversationRef, {
        participants: [user1Id, user2Id],
        participantNames: [user1Name, user2Name],
        lastMessage: "No messages yet.",
        lastMessageTimestamp: serverTimestamp(),
        // Add this object to initialize unread counts
        unreadCounts: {
          [user1Id]: 0,
          [user2Id]: 0,
        },
      });
    }
    
    revalidatePath("/chat");
    return { conversationId };

  } catch (error) {
    console.error("Error in createOrGetConversation:", error);
    return { error: "Failed to start conversation." };
  }
}

/**
 * Fetches all conversations for a given user.
 * @param {string} userId - The ID of the user whose conversations to fetch.
 * @returns {Array} An array of conversation objects.
 */
export async function getUserConversations(userId) {
  const conversationsRef = collection(db, "conversations");
  const q = query(
    conversationsRef,
    where("participants", "array-contains", userId),
    orderBy("lastMessageTimestamp", "desc")
  );

  try {
    const querySnapshot = await getDocs(q);
    const conversations = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return conversations;
  } catch (error) {
    console.error("Error fetching user conversations:", error);
    return [];
  }
}
