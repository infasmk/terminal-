import { db } from '../lib/firebase';
import { doc, setDoc, updateDoc, onSnapshot, collection, query, getDocs } from 'firebase/firestore';
import { UserProfile } from '../types';

let typingTimeout: NodeJS.Timeout | null = null;

export async function updateUserPresence(uid: string, email: string, displayName: string, isOnline: boolean) {
  if (!uid) return;
  const userRef = doc(db, 'users', uid);
  try {
    await setDoc(
      userRef,
      {
        uid,
        email,
        displayName: displayName || (email.toLowerCase().includes('02') ? 'OPERATOR_02' : 'OPERATOR_01'),
        isOnline,
        lastSeen: Date.now(),
        isTyping: false,
        role: 'OPERATOR',
      },
      { merge: true }
    );
  } catch (err) {
    console.error('Error updating user presence:', err);
  }
}

export async function setTypingState(uid: string, isTyping: boolean) {
  if (!uid) return;
  const userRef = doc(db, 'users', uid);
  try {
    await updateDoc(userRef, { isTyping });
  } catch {
    // Ignore if doc doesn't exist yet
  }

  if (isTyping) {
    if (typingTimeout) clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      setTypingState(uid, false);
    }, 3000);
  }
}

export function subscribeToUsers(currentUid: string, callback: (users: UserProfile[]) => void) {
  const usersRef = collection(db, 'users');
  return onSnapshot(
    usersRef,
    (snapshot) => {
      const list: UserProfile[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as UserProfile;
        list.push(data);
      });
      callback(list);
    },
    (err) => {
      console.warn('Error listening to users presence:', err);
    }
  );
}

export async function getActiveUserCount(): Promise<{ total: number; online: number }> {
  try {
    const q = query(collection(db, 'users'));
    const snap = await getDocs(q);
    let online = 0;
    snap.forEach((docSnap) => {
      if (docSnap.data().isOnline) online++;
    });
    return { total: snap.size || 2, online: online || 1 };
  } catch {
    return { total: 2, online: 1 };
  }
}
