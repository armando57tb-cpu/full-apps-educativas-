import React, { useState, useEffect } from 'react';
import { UserProfile, LanguageCode, CertificateData, UserSecuritySettings } from './types';
import { HeaderNav, DeviceViewportMode } from './components/HeaderNav';
import { LanguageLearning } from './components/LanguageLearning';
import { ChessGame } from './components/ChessGame';
import { CulturalLegends } from './components/CulturalLegends';
import { UserProfileModal } from './components/UserProfileModal';
import { CertificateModal } from './components/CertificateModal';
import { FreemiumModal } from './components/FreemiumModal';
import { ArchitectBlueprintModal } from './components/ArchitectBlueprintModal';
import { GoogleSignInSheet } from './components/GoogleSignInSheet';
import { SecurityCenterModal } from './components/SecurityCenterModal';
import { AiAppSearchModal } from './components/AiAppSearchModal';
import { WebAcademicBrowserModal } from './components/WebAcademicBrowserModal';
import { AppSearchHit } from './utils/appSearchLogic';
import { playChime } from './utils/audioSpeech';
import {
  auth,
  FirebaseUser,
  onAuthStateChanged,
  signInWithGoogleCloud,
  signOutFirebaseCloud,
  syncProfileToCloudFirestore,
  loadProfileFromCloudFirestore,
} from './firebase';
import { buildFirebaseGoogleProfile, mergeCloudProfileState } from './utils/cloudAuthLogic';
import { recordDailyXpEarned } from './utils/profileStatsLogic';

const DEFAULT_SECURITY_SETTINGS: UserSecuritySettings = {
  biometricsEnabled: false,
  twoFactorEnabled: false,
  securityPin: '123456',
  isAppLockActive: true,
  lastLoginDevice: 'Web • Firebase OAuth',
  lastLoginIp: 'Ecuador',
  lastLoginTimestamp: new Date().toISOString(),
  sessionToken: 'yr_firebase_session',
  securityScore: 90,
  failedAttempts: 0,
};

const GUEST_PREVIEW_PROFILE: UserProfile = {
  id: 'guest-pending-firebase',
  displayName: 'Invitado Google',
  username: 'google',
  email: '',
  avatarUrl: '',
  avatarType: 'initial',
  accountCategory: 'primary',
  accountLabel: 'Cuenta Google',
  streakDays: 1,
  xp: 0,
  dailyXpHistory: {},
  chakanas: 0,
  currentLanguage: 'kichwa',
  languageLevels: {},
  isPro: false,
  completedLessonIds: [],
  savedMythIds: ['myth-cantuna'],
  adUnlockedMythIds: [],
  certificates: [],
  chessStats: {
    elo: 1200,
    wins: 0,
    draws: 0,
    losses: 0,
  },
  security: DEFAULT_SECURITY_SETTINGS,
};

const CACHE_PREFIX = 'yachay_firebase_user_v5_';

function readCachedFirebaseProfile(uid: string): UserProfile | null {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${uid}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as UserProfile) : null;
  } catch {
    return null;
  }
}

function writeCachedFirebaseProfile(uid: string, profile: UserProfile): void {
  try {
    localStorage.setItem(`${CACHE_PREFIX}${uid}`, JSON.stringify(profile));
  } catch {
    // ignore storage limits
  }
}

export default function App() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authInitialized, setAuthInitialized] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserProfile>(GUEST_PREVIEW_PROFILE);

  const [currentTab, setCurrentTab] = useState<'languages' | 'chess' | 'myths' | 'profile'>('languages');
  const [viewportMode, setViewportMode] = useState<DeviceViewportMode>('responsive');

  // Modals
  const [isFreemiumOpen, setIsFreemiumOpen] = useState<boolean>(false);
  const [isBlueprintOpen, setIsBlueprintOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isSecurityCenterOpen, setIsSecurityCenterOpen] = useState<boolean>(false);
  const [isAiSearchOpen, setIsAiSearchOpen] = useState<boolean>(false);
  const [webBrowserState, setWebBrowserState] = useState<{ isOpen: boolean; initialQuery: string }>({
    isOpen: false,
    initialQuery: '',
  });
  const [focusedMythId, setFocusedMythId] = useState<string | null>(null);
  const [certModal, setCertModal] = useState<{ isOpen: boolean; lang: LanguageCode; level: string }>({
    isOpen: false,
    lang: 'kichwa',
    level: 'Principiante A1',
  });

  const handleNavigateSearchHit = (hit: AppSearchHit) => {
    setCurrentTab(hit.targetTab);
    if (hit.targetTab === 'languages' && hit.languageCode) {
      handleUpdateUser({ currentLanguage: hit.languageCode });
    }
    if (hit.targetTab === 'myths' && hit.mythId) {
      setFocusedMythId(hit.mythId);
    }
    playChime('click');
  };

  const hydrateUserFromFirebase = async (fbUser: FirebaseUser): Promise<UserProfile> => {
    const baseProfile = buildFirebaseGoogleProfile({
      uid: fbUser.uid,
      displayName: fbUser.displayName || 'Usuario Google',
      email: fbUser.email || '',
      photoURL: fbUser.photoURL || '',
      securityTemplate: DEFAULT_SECURITY_SETTINGS,
    });

    const cached = readCachedFirebaseProfile(fbUser.uid);
    const initialMerged = cached ? mergeCloudProfileState(baseProfile, cached) : baseProfile;
    setCurrentUser(initialMerged);
    writeCachedFirebaseProfile(fbUser.uid, initialMerged);

    try {
      const cloudPatch = await loadProfileFromCloudFirestore(fbUser);
      if (cloudPatch) {
        const cloudMerged = mergeCloudProfileState(initialMerged, cloudPatch);
        setCurrentUser(cloudMerged);
        writeCachedFirebaseProfile(fbUser.uid, cloudMerged);
        return cloudMerged;
      }
      // First sign-in for this Google account: create initial Firestore cloud record
      void syncProfileToCloudFirestore(initialMerged).catch(() => {});
    } catch {
      // Keep local cache if offline
    }
    return initialMerged;
  };

  // Subscribe strictly to Firebase Authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async fbUser => {
      setAuthInitialized(true);
      if (!fbUser) {
        setFirebaseUser(null);
        setCurrentUser(GUEST_PREVIEW_PROFILE);
        return;
      }

      setFirebaseUser(fbUser);
      await hydrateUserFromFirebase(fbUser);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateUser = (updated: Partial<UserProfile>) => {
    const nowIso = new Date().toISOString();
    setCurrentUser(prev => {
      const xpDelta =
        typeof updated.xp === 'number' && updated.xp > prev.xp ? updated.xp - prev.xp : 0;
      const nextDailyHistory =
        updated.dailyXpHistory !== undefined
          ? updated.dailyXpHistory
          : xpDelta > 0
          ? recordDailyXpEarned(prev.dailyXpHistory, xpDelta)
          : prev.dailyXpHistory;

      const nextProfile: UserProfile = {
        ...prev,
        ...updated,
        dailyXpHistory: nextDailyHistory,
        lastCloudSyncAt: nowIso,
      };
      if (firebaseUser) {
        writeCachedFirebaseProfile(firebaseUser.uid, nextProfile);
        void syncProfileToCloudFirestore(nextProfile).catch(() => {});
      }
      return nextProfile;
    });
  };

  const handleUpgradeToPro = () => {
    handleUpdateUser({ isPro: true });
  };

  const handleOpenCertificate = (languageCode: LanguageCode, level: string) => {
    setCertModal({
      isOpen: true,
      lang: languageCode,
      level,
    });
    playChime('bell');
  };

  const handleSaveCertificate = (newCert: CertificateData) => {
    const exists = currentUser.certificates.some(c => c.id === newCert.id);
    if (!exists) {
      handleUpdateUser({
        certificates: [newCert, ...currentUser.certificates],
      });
    }
  };

  // Switch Google account or sign in exclusively with Firebase Google OAuth
  const handleGoogleCloudLogin = async (): Promise<{ ok: boolean; error?: string }> => {
    try {
      const fbUser = await signInWithGoogleCloud();
      setFirebaseUser(fbUser);
      await hydrateUserFromFirebase(fbUser);
      setIsAuthOpen(false);
      return { ok: true };
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        return {
          ok: false,
          error: 'Ventana de Google cerrada antes de completar el inicio de sesión.',
        };
      }
      if (code === 'auth/popup-blocked') {
        return {
          ok: false,
          error: 'Tu navegador bloqueó la ventana emergente de Google. Permite popups e inténtalo de nuevo.',
        };
      }
      if (code === 'auth/unauthorized-domain') {
        return {
          ok: false,
          error: 'Este dominio requiere autorización en Firebase Authentication para completar el acceso con Google.',
        };
      }
      return {
        ok: false,
        error: 'No se pudo iniciar sesión con Firebase Google en este momento. Intenta nuevamente.',
      };
    }
  };

  const handleManualCloudSync = async (): Promise<boolean> => {
    const synced = await syncProfileToCloudFirestore(currentUser).catch(() => false);
    handleUpdateUser({ lastCloudSyncAt: new Date().toISOString() });
    return synced;
  };

  const handleLogout = async () => {
    await signOutFirebaseCloud();
    setFirebaseUser(null);
    setCurrentUser(GUEST_PREVIEW_PROFILE);
    setIsSecurityCenterOpen(false);
    setIsAuthOpen(true);
    playChime('click');
  };

  const isAuthenticated = Boolean(firebaseUser);
  const showAuthSheet = (authInitialized && !isAuthenticated) || isAuthOpen;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Outer shell: switchable between Phone, Tablet, or Fluid Responsive */}
      <div
        className={`flex-1 flex flex-col ${
          viewportMode !== 'responsive' ? 'items-center justify-center p-2 sm:p-6 bg-slate-900/90' : ''
        }`}
      >
        <div
          className={`w-full flex-1 flex flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950/95 shadow-2xl transition-all duration-300 ${
            viewportMode === 'phone'
              ? 'max-w-[412px] min-h-[840px] rounded-[44px] border-[10px] border-slate-800 ring-2 ring-sky-500/20 overflow-hidden relative'
              : viewportMode === 'tablet'
              ? 'max-w-[820px] min-h-[960px] rounded-[36px] border-[12px] border-slate-800 ring-2 ring-amber-500/20 overflow-hidden relative'
              : 'max-w-6xl mx-auto'
          }`}
        >
          {/* Navigation Bar with iOS Liquid Glass rectangular capsule */}
          <HeaderNav
            user={currentUser}
            currentTab={currentTab}
            onSelectTab={tab => {
              setCurrentTab(tab);
              playChime('click');
            }}
            onOpenFreemium={() => {
              setIsFreemiumOpen(true);
              playChime('click');
            }}
            onOpenBlueprint={() => {
              setIsBlueprintOpen(true);
              playChime('click');
            }}
            onOpenAuth={() => {
              setIsAuthOpen(true);
              playChime('click');
            }}
            onOpenSecurity={() => {
              setIsSecurityCenterOpen(true);
              playChime('click');
            }}
            onOpenAiSearch={() => {
              setIsAiSearchOpen(true);
              playChime('click');
            }}
            onOpenWebBrowser={() => {
              setWebBrowserState({ isOpen: true, initialQuery: '' });
              playChime('click');
            }}
            viewportMode={viewportMode}
            onChangeViewportMode={mode => {
              setViewportMode(mode);
              playChime('click');
            }}
          />

          {/* Main App Content Viewport with Short Section Entrance Animation */}
          <main className="flex-1 p-3 sm:p-5 md:p-6 overflow-y-auto">
            <div key={currentTab} className="animate-section-enter">
              {currentTab === 'languages' && (
                <LanguageLearning
                  user={currentUser}
                  onUpdateUser={handleUpdateUser}
                  onOpenFreemium={() => setIsFreemiumOpen(true)}
                  onOpenCertificateModal={handleOpenCertificate}
                />
              )}

              {currentTab === 'chess' && (
                <ChessGame
                  user={currentUser}
                  onUpdateUser={handleUpdateUser}
                  onOpenFreemium={() => setIsFreemiumOpen(true)}
                />
              )}

              {currentTab === 'myths' && (
                <CulturalLegends
                  user={currentUser}
                  onUpdateUser={handleUpdateUser}
                  onOpenFreemium={() => setIsFreemiumOpen(true)}
                  focusedMythId={focusedMythId}
                  onClearFocusedMyth={() => setFocusedMythId(null)}
                />
              )}

              {currentTab === 'profile' && (
                <UserProfileModal
                  user={currentUser}
                  onUpdateUser={handleUpdateUser}
                  onOpenFreemium={() => setIsFreemiumOpen(true)}
                  onOpenCertificateModal={handleOpenCertificate}
                  onSelectMyth={() => {
                    setCurrentTab('myths');
                  }}
                  onOpenAuth={() => {
                    setIsAuthOpen(true);
                  }}
                  onOpenSecurity={() => setIsSecurityCenterOpen(true)}
                  onLogout={() => void handleLogout()}
                  onSyncCloudNow={handleManualCloudSync}
                />
              )}
            </div>
          </main>

          {/* Mobile iOS Liquid Glass Rectangular Capsule Bottom Dock */}
          <footer className="sm:hidden sticky bottom-0 z-20 px-3 pt-1 pb-[max(0.65rem,env(safe-area-inset-bottom))] pointer-events-none">
            <div className="pointer-events-auto grid grid-cols-4 gap-1 p-1.5 rounded-[20px] bg-slate-900/75 backdrop-blur-2xl border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.28),0_10px_28px_rgba(0,0,0,0.6)] text-center text-[10px] font-bold">
              {[
                { id: 'languages' as const, icon: '🗣️', label: 'Idiomas' },
                { id: 'chess' as const, icon: '♟️', label: 'Ajedrez' },
                { id: 'myths' as const, icon: '📖', label: 'Leyendas' },
                { id: 'profile' as const, icon: '👤', label: 'Perfil' },
              ].map(item => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setCurrentTab(item.id);
                      playChime('click');
                    }}
                    className={`py-2 rounded-[14px] flex flex-col items-center gap-0.5 transition-all ${
                      isActive
                        ? 'bg-gradient-to-b from-white/25 via-sky-300/18 to-white/10 text-white border border-white/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.55)]'
                        : 'text-slate-300 border border-transparent'
                    }`}
                  >
                    <span className="text-base leading-none">{item.icon}</span>
                    <span className="whitespace-nowrap">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </footer>
        </div>
      </div>

      {/* MODALS */}
      {/* 1. Firebase-Only Google Sign-In / Account Switch / Logout Sheet */}
      {showAuthSheet && (
        <GoogleSignInSheet
          isAuthenticated={isAuthenticated}
          currentAccount={currentUser}
          onGoogleCloudLogin={handleGoogleCloudLogin}
          onLogout={handleLogout}
          onClose={() => {
            if (isAuthenticated) setIsAuthOpen(false);
          }}
          isStartupEntry={!isAuthenticated}
        />
      )}

      {/* 2. Security & Privacy Modal */}
      {isSecurityCenterOpen && (
        <SecurityCenterModal
          user={currentUser}
          onUpdateSecurity={newSec => handleUpdateUser({ security: newSec })}
          onLockAppNow={() => void handleLogout()}
          onClose={() => setIsSecurityCenterOpen(false)}
        />
      )}

      {/* 3. Freemium Paywall ($1.25 USD) */}
      {isFreemiumOpen && (
        <FreemiumModal
          user={currentUser}
          onClose={() => setIsFreemiumOpen(false)}
          onUpgradeSuccess={handleUpgradeToPro}
        />
      )}

      {/* 4. Certificate Modal */}
      {certModal.isOpen && (
        <CertificateModal
          user={currentUser}
          languageCode={certModal.lang}
          level={certModal.level}
          onClose={() => setCertModal(prev => ({ ...prev, isOpen: false }))}
          onOpenFreemium={() => setIsFreemiumOpen(true)}
          onSaveCertificate={handleSaveCertificate}
        />
      )}

      {/* 5. Architect & Lead Product Manager Blueprint Modal */}
      {isBlueprintOpen && (
        <ArchitectBlueprintModal onClose={() => setIsBlueprintOpen(false)} />
      )}

      {/* 6. AI In-App Search Modal (Gemini + Catalog) */}
      {isAiSearchOpen && (
        <AiAppSearchModal
          onClose={() => setIsAiSearchOpen(false)}
          onNavigateHit={handleNavigateSearchHit}
          onOpenWebSearch={q => {
            setWebBrowserState({ isOpen: true, initialQuery: q });
            playChime('click');
          }}
        />
      )}

      {/* 7. In-App Internet, Books & Academic Sources Browser */}
      {webBrowserState.isOpen && (
        <WebAcademicBrowserModal
          initialQuery={webBrowserState.initialQuery}
          onClose={() => setWebBrowserState({ isOpen: false, initialQuery: '' })}
        />
      )}
    </div>
  );
}
