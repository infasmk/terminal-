import { db } from '../lib/firebase';
import {
  collection,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  arrayUnion,
  getDocs,
} from 'firebase/firestore';
import { Message, MessageType, FileAttachment, SystemLog } from '../types';

const CHANNEL_ID = 'PRIVATE_CHANNEL_01';

export async function addSystemLog(event: string, level: 'INFO' | 'WARN' | 'SEC' | 'ERR' = 'INFO', userUid?: string) {
  try {
    const timeStr = new Date().toTimeString().split(' ')[0]; // e.g. "20:42:11"
    await addDoc(collection(db, 'system_logs'), {
      timestamp: timeStr,
      event,
      level,
      userUid: userUid || 'SYSTEM',
      createdAt: Date.now(),
    });
  } catch (err) {
    console.warn('System log write skipped:', err);
  }
}

export function subscribeToSystemLogs(callback: (logs: SystemLog[]) => void) {
  const q = query(collection(db, 'system_logs'), orderBy('createdAt', 'desc'), limit(50));
  return onSnapshot(
    q,
    (snapshot) => {
      const logs: SystemLog[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        logs.push({
          id: docSnap.id,
          timestamp: d.timestamp || '00:00:00',
          event: d.event || '',
          level: d.level || 'INFO',
          userUid: d.userUid,
        });
      });
      callback(logs.reverse());
    },
    (err) => {
      console.warn('System logs snapshot error:', err);
    }
  );
}

export async function sendMessage(
  channelId: string,
  senderUid: string,
  senderName: string,
  senderEmail: string,
  text: string,
  type: MessageType = 'text',
  attachment?: FileAttachment,
  expirationHours = 0
): Promise<string> {
  const now = Date.now();
  const expiresAt = expirationHours > 0 ? now + expirationHours * 3600 * 1000 : undefined;

  // Clean attachment object to ensure no undefined fields exist
  let cleanAttachment: Record<string, unknown> | null = null;
  if (attachment) {
    cleanAttachment = {};
    for (const [key, val] of Object.entries(attachment)) {
      if (val !== undefined) {
        cleanAttachment[key] = val;
      }
    }
  }

  const msgData: Record<string, unknown> = {
    channelId: channelId || 'ROOM_ALPHA',
    senderUid,
    senderName,
    senderEmail,
    text: text || '',
    type,
    attachment: cleanAttachment,
    readBy: [senderUid],
    createdAt: now,
  };

  if (expiresAt !== undefined) {
    msgData.expiresAt = expiresAt;
  }

  const docRef = await addDoc(collection(db, 'messages'), msgData);
  await addSystemLog(`MESSAGE TRANSMITTED (${type.toUpperCase()}) IN ROOM [${channelId}] BY ${senderName}`, 'INFO', senderUid);
  return docRef.id;
}

export function subscribeToMessages(channelId: string, currentUid: string, callback: (messages: Message[]) => void) {
  const activeChannel = channelId || 'ROOM_ALPHA';
  const q = query(
    collection(db, 'messages'),
    where('channelId', '==', activeChannel),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const msgs: Message[] = [];
      const now = Date.now();

      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        // Skip expired messages
        if (d.expiresAt && d.expiresAt < now) {
          // Async deletion of expired doc
          deleteDoc(doc(db, 'messages', docSnap.id)).catch(() => {});
          return;
        }

        msgs.push({
          id: docSnap.id,
          channelId: d.channelId,
          senderUid: d.senderUid,
          senderName: d.senderName || 'OPERATOR',
          senderEmail: d.senderEmail || '',
          text: d.text || '',
          type: d.type || 'text',
          attachment: d.attachment ? d.attachment : undefined,
          readBy: d.readBy || [],
          createdAt: d.createdAt || Date.now(),
          expiresAt: d.expiresAt,
        });
      });

      callback(msgs);
    },
    (err) => {
      console.warn('Messages snapshot error:', err);
    }
  );
}

export async function markMessagesAsRead(messageIds: string[], currentUid: string) {
  if (!currentUid || messageIds.length === 0) return;
  for (const id of messageIds) {
    try {
      const msgRef = doc(db, 'messages', id);
      await updateDoc(msgRef, {
        readBy: arrayUnion(currentUid),
      });
    } catch {
      // ignore
    }
  }
}

export async function deleteMessage(messageId: string, userUid: string) {
  try {
    await deleteDoc(doc(db, 'messages', messageId));
    await addSystemLog(`MESSAGE DELETED [${messageId.slice(0, 8)}] BY USER`, 'WARN', userUid);
  } catch (err) {
    console.error('Delete message error:', err);
    throw err;
  }
}

export async function clearAllMessagesAndLogs(channelId: string, userUid: string) {
  try {
    const activeChannel = channelId || 'ROOM_ALPHA';
    // Delete all messages in the specified room
    const msgQuery = query(collection(db, 'messages'), where('channelId', '==', activeChannel));
    const msgSnap = await getDocs(msgQuery);
    const deleteMsgPromises = msgSnap.docs.map((docSnap) => deleteDoc(doc(db, 'messages', docSnap.id)));
    await Promise.all(deleteMsgPromises);

    // Delete all system logs
    const logQuery = query(collection(db, 'system_logs'));
    const logSnap = await getDocs(logQuery);
    const deleteLogPromises = logSnap.docs.map((docSnap) => deleteDoc(doc(db, 'system_logs', docSnap.id)));
    await Promise.all(deleteLogPromises);

    // Write log entry for clean state
    await addSystemLog(`ROOM [${activeChannel}] CLEARED & SYSTEM LOGS PURGED`, 'SEC', userUid);
  } catch (err) {
    console.error('Error clearing messages and logs:', err);
  }
}

export async function purgeExpiredMessages(channelId: string) {
  try {
    const activeChannel = channelId || 'ROOM_ALPHA';
    const q = query(collection(db, 'messages'), where('channelId', '==', activeChannel));
    const snap = await getDocs(q);
    const now = Date.now();
    snap.forEach((docSnap) => {
      const d = docSnap.data();
      if (d.expiresAt && d.expiresAt < now) {
        deleteDoc(doc(db, 'messages', docSnap.id)).catch(() => {});
      }
    });
  } catch {
    // ignore
  }
}
