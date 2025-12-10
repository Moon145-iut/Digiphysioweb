/**
 * Chat History Service
 * Saves chat messages to Firestore for logged-in users
 */

import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp?: string;
}

/**
 * Save a single chat message to Firestore
 * Creates/updates user's chat document and adds message to messages subcollection
 */
export const saveChatMessage = async (
  userId: string,
  message: ChatMessage
): Promise<void> => {
  try {
    // Reference to user's chat document
    const chatDocRef = doc(db, 'chats', userId);
    
    // Update/create the chat document with last updated timestamp
    await setDoc(chatDocRef, { updatedAt: serverTimestamp() }, { merge: true });
    
    // Add message to messages subcollection with timestamp
    const messagesRef = collection(chatDocRef, 'messages');
    await addDoc(messagesRef, {
      role: message.role,
      text: message.text,
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString(),
    });
    
    console.log('Chat message saved for user:', userId);
  } catch (error) {
    console.error('Error saving chat message to Firestore:', error);
    // Don't throw - chat should still work even if persistence fails
  }
};

/**
 * Save multiple messages at once (e.g., initial history)
 */
export const saveChatMessages = async (
  userId: string,
  messages: ChatMessage[]
): Promise<void> => {
  try {
    const chatDocRef = doc(db, 'chats', userId);
    await setDoc(chatDocRef, { updatedAt: serverTimestamp() }, { merge: true });
    
    const messagesRef = collection(chatDocRef, 'messages');
    
    for (const message of messages) {
      await addDoc(messagesRef, {
        role: message.role,
        text: message.text,
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString(),
      });
    }
    
    console.log('Chat messages saved for user:', userId);
  } catch (error) {
    console.error('Error saving chat messages to Firestore:', error);
  }
};
