import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface RoomMeta {
  roomId: string;
  password?: string;
  createdAt: number;
  createdBy: string;
}

export async function getRoomMeta(roomId: string): Promise<RoomMeta | null> {
  try {
    const docRef = doc(db, 'rooms', roomId.toUpperCase());
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as RoomMeta;
    }
    return null;
  } catch (err) {
    console.warn('Error fetching room meta:', err);
    return null;
  }
}

export async function createOrUpdateRoom(
  roomId: string,
  password?: string,
  createdBy: string = 'OPERATOR'
): Promise<RoomMeta> {
  const roomKey = roomId.toUpperCase().replace(/[^A-Z0-9_-]/g, '_');
  const roomData: RoomMeta = {
    roomId: roomKey,
    createdAt: Date.now(),
    createdBy,
  };

  if (password && password.trim()) {
    roomData.password = password.trim();
  }

  try {
    await setDoc(doc(db, 'rooms', roomKey), roomData, { merge: true });
  } catch (err) {
    console.warn('Error saving room meta:', err);
  }
  return roomData;
}
