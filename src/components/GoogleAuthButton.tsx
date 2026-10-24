import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { googleSignIn, logout } from '../services/googleAuth';
import { HardDrive, LogOut, CheckCircle2, Loader2 } from 'lucide-react';

interface GoogleAuthButtonProps {
  user: User | null;
  onAuthChange: (user: User | null, token: string | null) => void;
  onOpenDriveModal: () => void;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  user,
  onAuthChange,
  onOpenDriveModal,
}) => {
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      const result = await googleSignIn();
      if (result) {
        onAuthChange(result.user, result.accessToken);
      }
    } catch (err: unknown) {
      console.error('Sign-in failed:', err);
      const msg = err instanceof Error ? err.message : 'Google 로그인에 실패했습니다.';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      onAuthChange(null, null);
      setMenuOpen(false);
    } catch (err) {
      console.error('Sign-out failed:', err);
    }
  };

  if (user) {
    return (
      <div className="relative inline-block text-left">
        <div className="flex items-center gap-1.5">
          {/* Quick Drive Modal Trigger */}
          <button
            type="button"
            onClick={onOpenDriveModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition active:scale-95 cursor-pointer"
            title="Google Drive 파일 브라우저 및 동기화 열기"
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Google Drive</span>
          </button>

          {/* User Profile Pill */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xl text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
            title="계정 정보 및 관리"
          >
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-5 h-5 rounded-full object-cover border border-white/20"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                {user.displayName?.[0] || 'G'}
              </div>
            )}
            <span className="hidden md:inline font-semibold max-w-[120px] truncate text-slate-300">
              {user.displayName || user.email}
            </span>
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          </button>
        </div>

        {/* Dropdown Menu */}
        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-700 shadow-xl z-50 p-2 text-xs text-white">
              <div className="px-3 py-2 border-b border-slate-800">
                <p className="font-bold text-slate-200 truncate">{user.displayName || '구글 사용자'}</p>
                <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold">
                  Google Drive 연동됨
                </span>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenDriveModal();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 flex items-center gap-2 text-slate-300 hover:text-white transition cursor-pointer"
                >
                  <HardDrive className="w-3.5 h-3.5 text-blue-400" />
                  <span>Google Drive 파일 탐색기</span>
                </button>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-950/40 text-rose-300 hover:text-rose-200 flex items-center gap-2 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>로그아웃</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Not signed in: Standard styled "Sign in with Google" button compliant with Google Branding Guidelines
  return (
    <button
      type="button"
      onClick={handleSignIn}
      disabled={loading}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold shadow-sm border border-slate-300 transition active:scale-95 disabled:opacity-60 cursor-pointer"
      title="Google 계정으로 로그인하여 Google Drive 연동"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
      ) : (
        <svg
          className="w-4 h-4 shrink-0"
          viewBox="0 0 48 48"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
          />
          <path
            fill="#4285F4"
            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
          />
          <path
            fill="#FBBC05"
            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
          />
          <path
            fill="#34A853"
            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
          />
        </svg>
      )}
      <span>Google 로그인 (Drive 연동)</span>
    </button>
  );
};
