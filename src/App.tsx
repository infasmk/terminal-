/**
 * NEXUS // MINIMAL SECURE SERVER CONSOLE & PRIVATE COMMUNICATION SYSTEM
 * @license Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { db } from './lib/firebase';
import {
  Message,
  MessageType,
  UserProfile,
  SystemLog,
  ViewDirectory,
  AppSettings,
  UploadProgress,
  FileAttachment,
} from './types';
import {
  updateUserPresence,
  setTypingState,
  subscribeToUsers,
  getActiveUserCount,
} from './services/presenceService';
import {
  sendMessage,
  subscribeToMessages,
  markMessagesAsRead,
  deleteMessage,
  subscribeToSystemLogs,
  addSystemLog,
  clearAllMessagesAndLogs,
  purgeExpiredMessages,
} from './services/chatService';
import { uploadFileWithProgress } from './services/storageService';
import { sounds } from './lib/audio';

import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { MainConsole } from './components/MainConsole';
import { DirectoryView } from './components/DirectoryView';
import { SettingsModal } from './components/SettingsModal';
import { LoginConsole } from './components/LoginConsole';
import { AccessDeniedModal } from './components/AccessDeniedModal';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { ImageViewerModal } from './components/ImageViewerModal';
import { ShareRoomModal } from './components/ShareRoomModal';
import { Footer } from './components/Footer';
import { getRoomMeta, createOrUpdateRoom, RoomMeta } from './services/roomService';

interface OperatorSession {
  uid: string;
  email: string;
  displayName: string;
}

function getSessionForOperator(name: string): OperatorSession {
  const sanitized = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
  const key = `nexus_session_uid_${sanitized}`;
  let uid = localStorage.getItem(key);
  if (!uid) {
    uid = `node_${sanitized || 'op'}_${Math.random().toString(36).substring(2, 8)}`;
    localStorage.setItem(key, uid);
  }
  return {
    uid,
    email: `${sanitized || 'operator'}@nexus.internal`,
    displayName: name.trim(),
  };
}

export default function App() {
  const [operatorName, setOperatorName] = useState<string>(() => localStorage.getItem('nexus_operator_name') || '');
  const [currentUser, setCurrentUser] = useState<OperatorSession | null>(() => {
    const saved = localStorage.getItem('nexus_operator_name');
    return saved ? getSessionForOperator(saved) : null;
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Application State
  const [currentView, setCurrentView] = useState<ViewDirectory>('MESSAGES');
  const [currentRoomId, setCurrentRoomId] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) return roomParam.toUpperCase().replace(/[^A-Z0-9_-]/g, '_');
    return localStorage.getItem('nexus_room_id') || 'ROOM_ALPHA';
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [activeUpload, setActiveUpload] = useState<UploadProgress | null>(null);
  const [cancelUploadFn, setCancelUploadFn] = useState<(() => void) | null>(null);

  // Room Password & Security State
  const [roomMetaMap, setRoomMetaMap] = useState<Record<string, RoomMeta>>({});
  const [unlockedRooms, setUnlockedRooms] = useState<Record<string, boolean>>({});
  const [isShareRoomOpen, setIsShareRoomOpen] = useState(false);

  // Check URL params on initial mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    const passParam = params.get('pass');
    if (roomParam) {
      const formatted = roomParam.toUpperCase().replace(/[^A-Z0-9_-]/g, '_');
      if (passParam) {
        setUnlockedRooms((prev) => ({ ...prev, [formatted]: true }));
        createOrUpdateRoom(formatted, passParam, 'GUEST_LINK');
      }
    }
  }, []);

  // Fetch current room metadata
  useEffect(() => {
    let isMounted = true;
    getRoomMeta(currentRoomId).then((meta) => {
      if (!isMounted) return;
      if (meta) {
        setRoomMetaMap((prev) => ({ ...prev, [currentRoomId]: meta }));
      }
    });
    return () => {
      isMounted = false;
    };
  }, [currentRoomId]);

  const isCurrentRoomLocked = Boolean(
    roomMetaMap[currentRoomId]?.password && !unlockedRooms[currentRoomId]
  );

  const handleSelectRoom = async (roomId: string, passwordProvided?: string) => {
    const targetRoom = roomId.toUpperCase().replace(/[^A-Z0-9_-]/g, '_');

    let meta = roomMetaMap[targetRoom];
    if (!meta) {
      meta = (await getRoomMeta(targetRoom)) || {
        roomId: targetRoom,
        createdAt: Date.now(),
        createdBy: currentUser?.uid || 'OPERATOR',
      };
      setRoomMetaMap((prev) => ({ ...prev, [targetRoom]: meta }));
    }

    if (passwordProvided && passwordProvided.trim()) {
      await createOrUpdateRoom(targetRoom, passwordProvided.trim(), currentUser?.uid || 'OPERATOR');
      meta.password = passwordProvided.trim();
      setRoomMetaMap((prev) => ({ ...prev, [targetRoom]: { ...meta, password: passwordProvided.trim() } }));
      setUnlockedRooms((prev) => ({ ...prev, [targetRoom]: true }));
    }

    setCurrentRoomId(targetRoom);
    localStorage.setItem('nexus_room_id', targetRoom);
  };

  const handleUnlockRoom = async (enteredPassword: string): Promise<boolean> => {
    let meta = roomMetaMap[currentRoomId];
    if (!meta) {
      meta = (await getRoomMeta(currentRoomId)) || {
        roomId: currentRoomId,
        createdAt: Date.now(),
        createdBy: currentUser?.uid || 'OPERATOR',
      };
    }

    if (!meta.password || meta.password === enteredPassword.trim()) {
      setUnlockedRooms((prev) => ({ ...prev, [currentRoomId]: true }));
      return true;
    }

    return false;
  };

  // Modal states
  const [activeVideo, setActiveVideo] = useState<{
    url: string;
    name: string;
    hash: string;
    duration?: string;
    size?: number;
  } | null>(null);

  const [activeImage, setActiveImage] = useState<{
    url: string;
    name: string;
    hash: string;
  } | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Settings
  const [settings, setSettings] = useState<AppSettings>({
    compactMode: false,
    reducedMotion: false,
    soundAlerts: true,
    terminalFontSize: 'md',
    autoDownloadMaxMb: 50,
    messageExpirationHours: 0,
  });

  // Dynamic Server Uptime Counter
  const [uptimeSeconds, setUptimeSeconds] = useState(1053131); // ~12D 04:32:11 start

  useEffect(() => {
    const timer = setInterval(() => {
      setUptimeSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatUptime = (totalSecs: number): string => {
    const days = Math.floor(totalSecs / 86400);
    const hrs = Math.floor((totalSecs % 86400) / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${days}D ${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Sync initial user presence
  useEffect(() => {
    if (currentUser) {
      updateUserPresence(currentUser.uid, currentUser.email, currentUser.displayName, true);
      addSystemLog(`OPERATOR ONLINE: ${currentUser.displayName}`, 'SEC', currentUser.uid);
    }
  }, []);

  // Realtime Data Subscriptions
  useEffect(() => {
    if (!currentUser) return;

    // Presence subscription
    const unsubUsers = subscribeToUsers(currentUser.uid, (users) => {
      setUsersList(users);
    });

    // Messages subscription for active Room ID
    const isLocked = Boolean(roomMetaMap[currentRoomId]?.password && !unlockedRooms[currentRoomId]);
    if (isLocked) {
      setMessages([]);
      return;
    }

    const unsubMessages = subscribeToMessages(currentRoomId, currentUser.uid, (msgs) => {
      setMessages(msgs);

      // Play sound on new incoming message
      if (msgs.length > 0) {
        const lastMsg = msgs[msgs.length - 1];
        if (lastMsg.senderUid !== currentUser.uid && settings.soundAlerts) {
          sounds.playMessageReceived();
        }
      }

      // Mark unread messages as read
      const unreadIds = msgs
        .filter((m) => m.senderUid !== currentUser.uid && !m.readBy.includes(currentUser.uid))
        .map((m) => m.id);

      if (unreadIds.length > 0) {
        markMessagesAsRead(unreadIds, currentUser.uid);
      }
    });

    // System logs subscription
    const unsubLogs = subscribeToSystemLogs((logs) => {
      setSystemLogs(logs);
    });

    // Periodically purge expired messages for active Room ID
    purgeExpiredMessages(currentRoomId);

    return () => {
      unsubUsers();
      unsubMessages();
      unsubLogs();
    };
  }, [currentUser, currentRoomId, settings.soundAlerts]);

  // Connect with Name Handler
  const handleConnectWithName = async (name: string) => {
    setAuthError(null);
    try {
      const session = getSessionForOperator(name);
      localStorage.setItem('nexus_operator_name', name);
      setOperatorName(name);
      setCurrentUser(session);

      await updateUserPresence(session.uid, session.email, name, true);
      await addSystemLog(`OPERATOR CONNECTED: ${name}`, 'SEC', session.uid);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setAuthError(errorObj.message || 'CONNECTION FAILED');
    }
  };

  const handleSignOut = async () => {
    if (currentUser) {
      await clearAllMessagesAndLogs(currentRoomId, currentUser.uid);
      await updateUserPresence(currentUser.uid, currentUser.email, currentUser.displayName, false);
    }
    localStorage.removeItem('nexus_operator_name');
    setOperatorName('');
    setCurrentUser(null);
  };

  // Chat Actions
  const currentOperator = operatorName || 'OPERATOR_01';

  const handleSendMessage = async (text: string, type: MessageType = 'text') => {
    if (!currentUser) return;
    if (isCurrentRoomLocked) return;

    await sendMessage(
      currentRoomId,
      currentUser.uid,
      currentOperator,
      `${currentOperator}@nexus.internal`,
      text,
      type,
      undefined,
      settings.messageExpirationHours
    );
  };

  const handleFileUpload = (file: File) => {
    if (!currentUser) return;
    if (isCurrentRoomLocked) return;

    const { cancel, promise } = uploadFileWithProgress(file, currentUser.uid, (progress) => {
      setActiveUpload(progress);
    });

    setCancelUploadFn(() => cancel);

    promise
      .then(async (attachment: FileAttachment) => {
        const isVideo = file.type.startsWith('video/') || ['mp4', 'webm', 'mov', 'avi', 'mkv'].some((ext) => file.name.toLowerCase().endsWith(ext));
        const isImage = file.type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].some((ext) => file.name.toLowerCase().endsWith(ext));
        const msgType: MessageType = isVideo ? 'video' : isImage ? 'image' : 'file';

        await sendMessage(
          currentRoomId,
          currentUser.uid,
          currentOperator,
          `${currentOperator}@nexus.internal`,
          '',
          msgType,
          attachment,
          settings.messageExpirationHours
        );

        if (settings.soundAlerts) {
          sounds.playUploadSuccess();
        }
      })
      .catch((err) => {
        if (err.message !== 'UPLOAD_CANCELLED') {
          console.error('File upload failed:', err);
        }
      })
      .finally(() => {
        setActiveUpload(null);
        setCancelUploadFn(null);
      });
  };

  const handleCancelUpload = () => {
    if (cancelUploadFn) {
      cancelUploadFn();
    }
    setActiveUpload(null);
    setCancelUploadFn(null);
  };

  const handleUserTyping = () => {
    if (currentUser) {
      setTypingState(currentUser.uid, true);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!currentUser) return;
    await deleteMessage(messageId, currentUser.uid);
  };

  // Render Loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#050706] font-mono text-xs text-[#10b981] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin" />
        <div className="tracking-widest animate-pulse">NEXUS // BOOTING SERVER CONSOLE...</div>
      </div>
    );
  }

  // Render Unauthenticated or Name prompt
  if (!currentUser || !operatorName) {
    return (
      <LoginConsole
        onConnectWithName={handleConnectWithName}
        authError={authError}
      />
    );
  }

  // Render Main Application Console
  return (
    <div
      className={`min-h-screen bg-[#050706] text-[#e2e8f0] font-mono flex flex-col h-screen overflow-hidden ${
        settings.terminalFontSize === 'sm'
          ? 'text-xs'
          : settings.terminalFontSize === 'lg'
          ? 'text-sm'
          : 'text-xs'
      }`}
    >
      {/* Top Header */}
      <TopBar
        currentOperator={currentOperator}
        uptimeString={formatUptime(uptimeSeconds)}
        currentRoomId={currentRoomId}
        onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar */}
        <Sidebar
          currentView={currentView}
          onSelectView={setCurrentView}
          currentRoomId={currentRoomId}
          onSelectRoom={handleSelectRoom}
          onlineCount={usersList.filter((u) => u.isOnline).length || 1}
          totalUsersCount={usersList.length || 2}
          uptimeString={formatUptime(uptimeSeconds)}
          usersList={usersList}
          currentUid={currentUser.uid}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onSignOut={handleSignOut}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* View Content Area */}
        <main className="flex-1 flex flex-col bg-[#050706] overflow-hidden relative">
          {currentView === 'MESSAGES' && (
            <MainConsole
              messages={messages}
              currentUid={currentUser.uid}
              currentRoomId={currentRoomId}
              isRoomProtected={Boolean(roomMetaMap[currentRoomId]?.password)}
              isLocked={isCurrentRoomLocked}
              onUnlockRoom={handleUnlockRoom}
              onOpenShareRoom={() => setIsShareRoomOpen(true)}
              onSendMessage={handleSendMessage}
              onFileUpload={handleFileUpload}
              activeUpload={activeUpload}
              onCancelUpload={handleCancelUpload}
              usersList={usersList}
              onUserTyping={handleUserTyping}
              onOpenVideo={(url, name, hash, duration, size) =>
                setActiveVideo({ url, name, hash, duration, size })
              }
              onOpenImage={(url, name, hash) => setActiveImage({ url, name, hash })}
              onDeleteMessage={handleDeleteMessage}
              expirationHours={settings.messageExpirationHours}
              soundAlerts={settings.soundAlerts}
            />
          )}

          {(currentView === 'MEDIA' || currentView === 'FILES') && (
            <DirectoryView
              mode={currentView}
              messages={messages}
              isLocked={isCurrentRoomLocked}
              onOpenVideo={(url, name, hash, duration, size) =>
                setActiveVideo({ url, name, hash, duration, size })
              }
              onOpenImage={(url, name, hash) => setActiveImage({ url, name, hash })}
            />
          )}
        </main>
      </div>

      {/* Footer Status Bar */}
      <Footer />

      {/* Share Room & Password Modal */}
      {isShareRoomOpen && (
        <ShareRoomModal
          roomId={currentRoomId}
          currentPassword={roomMetaMap[currentRoomId]?.password || ''}
          userUid={currentUser.uid}
          onClose={() => setIsShareRoomOpen(false)}
          onPasswordUpdated={(newPass) => {
            setRoomMetaMap((prev) => ({
              ...prev,
              [currentRoomId]: {
                ...prev[currentRoomId],
                roomId: currentRoomId,
                password: newPass,
                createdAt: prev[currentRoomId]?.createdAt || Date.now(),
                createdBy: prev[currentRoomId]?.createdBy || currentUser.uid,
              },
            }));
            if (newPass) {
              setUnlockedRooms((prev) => ({ ...prev, [currentRoomId]: true }));
            }
          }}
        />
      )}

      {/* Video Player Modal */}
      {activeVideo && (
        <VideoPlayerModal
          url={activeVideo.url}
          name={activeVideo.name}
          hash={activeVideo.hash}
          duration={activeVideo.duration}
          size={activeVideo.size}
          onClose={() => setActiveVideo(null)}
        />
      )}

      {/* Image Viewer Modal */}
      {activeImage && (
        <ImageViewerModal
          url={activeImage.url}
          name={activeImage.name}
          hash={activeImage.hash}
          onClose={() => setActiveImage(null)}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={(newSt) => setSettings({ ...settings, ...newSt })}
          currentOperator={currentOperator}
          userEmail={currentUser.email || ''}
          onClose={() => setIsSettingsOpen(false)}
          onSignOut={handleSignOut}
          onPurgeAll={async () => {
            if (currentUser) {
              await clearAllMessagesAndLogs(currentRoomId, currentUser.uid);
            }
          }}
        />
      )}
    </div>
  );
}
