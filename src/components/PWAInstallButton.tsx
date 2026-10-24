import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide
  if (isInstalled) {
    return null;
  }

  // Android / Chromium / Desktop flow
  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm active:scale-95 cursor-pointer animate-pulse"
        title="스마트폰/PC에 앱으로 즉시 설치"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span>앱 설치</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>아이폰 앱 설치</span>
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setShowIOSGuide(false)}
          >
            <div
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-slate-900 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-base font-black">아이폰 / 아이패드 앱 설치</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                1. 사파리 브라우저 하단의 <strong>[공유]</strong> 버튼(네모에 위 화살표 아이콘)을 누릅니다.<br />
                2. 메뉴를 아래로 스크롤하여 <strong>[홈 화면에 추가]</strong>를 누릅니다.<br />
                3. 바탕화면에 <strong>B2B 라벨가이드</strong> 앱 아이콘이 생성되어 전체화면으로 실행됩니다.
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                확인
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Default fallback button
  return (
    <button
      type="button"
      onClick={() => {
        alert(
          '💡 모바일 브라우저(크롬, 사파리 등)에서 이 링크를 열면\n[홈 화면에 추가] 또는 [앱 설치]를 통해 즉시 스마트폰에 앱으로 설치됩니다!'
        );
      }}
      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
      title="앱 설치 안내"
    >
      <Smartphone className="w-3.5 h-3.5 text-blue-400" />
      <span className="hidden sm:inline">앱으로 설치</span>
    </button>
  );
};
