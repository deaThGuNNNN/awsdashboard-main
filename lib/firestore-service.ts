import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

export interface SavedSession {
  id: string;
  name: string;
  items: any[];
  totalCost: number;
  dateCreated: string;
  dateModified: string;
  userId: string;
}

export interface FirestoreSession extends Omit<SavedSession, 'id' | 'dateCreated' | 'dateModified'> {
  dateCreated: Timestamp;
  dateModified: Timestamp;
}

const SESSIONS_COLLECTION = 'saved-sessions';

export class FirestoreService {
  
  // Save a new session for a user
  static async saveSession(userId: string, sessionName: string, items: any[], totalCost: number): Promise<string> {
    try {
      const sessionData: Omit<FirestoreSession, 'id'> = {
        name: sessionName,
        items,
        totalCost,
        userId,
        dateCreated: serverTimestamp() as Timestamp,
        dateModified: serverTimestamp() as Timestamp,
      };

      const docRef = await addDoc(collection(db, SESSIONS_COLLECTION), sessionData);
      return docRef.id;
    } catch (error) {
      console.error('Error saving session:', error);
      throw new Error('Failed to save session');
    }
  }

  // Get all sessions for a user
  static async getUserSessions(userId: string): Promise<SavedSession[]> {
    try {
      const q = query(
        collection(db, SESSIONS_COLLECTION),
        where('userId', '==', userId),
        orderBy('dateModified', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const sessions: SavedSession[] = [];

      querySnapshot.forEach((doc: any) => {
        const data = doc.data() as FirestoreSession;
        sessions.push({
          id: doc.id,
          ...data,
          dateCreated: data.dateCreated.toDate().toISOString(),
          dateModified: data.dateModified.toDate().toISOString(),
        });
      });

      return sessions;
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw new Error('Failed to fetch sessions');
    }
  }

  // Delete a session
  static async deleteSession(sessionId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, SESSIONS_COLLECTION, sessionId));
    } catch (error) {
      console.error('Error deleting session:', error);
      throw new Error('Failed to delete session');
    }
  }

  // Update a session
  static async updateSession(sessionId: string, sessionName: string, items: any[], totalCost: number): Promise<void> {
    try {
      const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);
      await updateDoc(sessionRef, {
        name: sessionName,
        items,
        totalCost,
        dateModified: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating session:', error);
      throw new Error('Failed to update session');
    }
  }
} 