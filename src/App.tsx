import { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { GuideRule } from './types';
import { DEFAULT_GUIDES } from './data/defaultData';
import { BuyerSelector } from './components/BuyerSelector';
import { TutorialCardView } from './components/TutorialCardView';
import { ExcelTableView } from './components/ExcelTableView';
import { GuidelineModal } from './components/GuidelineModal';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { GoogleAuthButton } from './components/GoogleAuthButton';
import { initAuth, googleSignIn } from './services/googleAuth';
import { parseGuidesAndItemsFromExcel, downloadExcelTemplate } from './utils/excel';
import { PWAInstallButton } from './components/PWAInstallButton';
import {
  FileSpreadsheet,
  FileUp,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  HardDrive,
} from 'lucide-react';

export default function App() {
  const [guideRules, setGuideRules] = useState<GuideRule[]>(() => {
    try {
      const stored = localStorage.getItem('packing_guides_v2');
      return stored ? JSON.parse(stored) : DEFAULT_GUIDES;
    } catch {
      return DEFAULT_GUIDES;
    }
  });

  const [selectedBuyer, setSelectedBuyer] = useState<string>(() => {
    return guideRules[0]?.buyer || 'D-R-O';
  });

  const [currentView, setCurrentView] = useState<'main' | 'guide'>('main');
  const [isGuidelineModalOpen, setIsGuidelineModalOpen] = useState(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Initialize Firebase Auth state listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser) => setUser(currentUser),
      () => setUser(null)
    );
    return () => unsubscribe();
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('packing_guides_v2', JSON.stringify(guideRules));
  }, [guideRules]);

  // Current active guide object & index
  const currentIndex = guideRules.findIndex((g) => g.buyer === selectedBuyer);
  const activeGuide = guideRules[currentIndex >= 0 ? currentIndex : 0] || guideRules[0];

  // Navigation handlers
  const handlePrev = useCallback(() => {
    const prevIdx = (currentIndex - 1 + guideRules.length) % guideRules.length;
    setSelectedBuyer(guideRules[prevIdx].buyer);
  }, [currentIndex, guideRules]);

  const handleNext = useCallback(() => {
    const nextIdx = (currentIndex + 1) % guideRules.length;
    setSelectedBuyer(guideRules[nextIdx].buyer);
  }, [currentIndex, guideRules]);

  // Keyboard navigation (Left / Right arrow keys) when in guide view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (currentView === 'guide') {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          handlePrev();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          handleNext();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          setCurrentView('main');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext, currentView]);

  // Attached Photo Upload Handler for active buyer
  const handleUploadAttachedPhoto = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const targetBuyer = activeGuide.buyer;

      const updated = guideRules.map((r) => {
        if (r.buyer === targetBuyer) {
          return {
            ...r,
            hasRealPhoto: true,
            photoUrl: dataUrl,
            photoFileName: file.name,
          };
        }
        return r;
      });

      setGuideRules(updated);
      alert(`[${targetBuyer}] 실부착 사진이 저장되었습니다.`);
    };
    reader.readAsDataURL(file);
  };

  // Sticker Label Photo Upload Handler for active buyer
  const handleUploadStickerPhoto = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const targetBuyer = activeGuide.buyer;

      const updated = guideRules.map((r) => {
        if (r.buyer === targetBuyer) {
          return {
            ...r,
            stickerPhotoUrl: dataUrl,
            stickerPhotoFileName: file.name,
          };
        }
        return r;
      });

      setGuideRules(updated);
      alert(`[${targetBuyer}] 스티커 라벨 사진이 저장되었습니다.`);
    };
    reader.readAsDataURL(file);
  };

  // Excel Upload Handler
  const handleUploadExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const buffer = event.target?.result as ArrayBuffer;
        const result = parseGuidesAndItemsFromExcel(buffer);

        if (result.errors.length > 0) {
          alert('엑셀 분석 알림:\n' + result.errors.join('\n'));
        }

        if (result.guides.length > 0) {
          setGuideRules(result.guides);
          setSelectedBuyer(result.guides[0].buyer);
          alert(`엑셀 가이드 연동 완료! 총 ${result.guides.length}개 고객사가 등록되었습니다.`);
        }
      } catch (err) {
        console.error(err);
        alert('엑셀 파일을 읽는 도중 오류가 발생했습니다.');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  // Reset to default standard data
  const handleResetDefault = () => {
    if (confirm('최신 해외 B2B 표준 엑셀 가이드 데이터로 초기화하시겠습니까?')) {
      setGuideRules(DEFAULT_GUIDES);
      setSelectedBuyer(DEFAULT_GUIDES[0].buyer);
      setCurrentView('main');
      localStorage.removeItem('packing_guides_v2');
      alert('표준 데이터로 초기화되었습니다.');
    }
  };

  const handleOpenGuide = (buyer: string) => {
    setSelectedBuyer(buyer);
    setCurrentView('guide');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Google Drive integration handlers
  const handleApplyGuidesFromDrive = (newGuides: GuideRule[]) => {
    setGuideRules(newGuides);
    if (newGuides.length > 0) {
      setSelectedBuyer(newGuides[0].buyer);
    }
  };

  const handleApplyStickerPhotoFromDrive = (buyer: string, photoUrl: string, fileName: string) => {
    setGuideRules((prev) =>
      prev.map((r) =>
        r.buyer === buyer
          ? { ...r, stickerPhotoUrl: photoUrl, stickerPhotoFileName: fileName }
          : r
      )
    );
  };

  const handleApplyAttachedPhotoFromDrive = (buyer: string, photoUrl: string, fileName: string) => {
    setGuideRules((prev) =>
      prev.map((r) =>
        r.buyer === buyer
          ? { ...r, hasRealPhoto: true, photoUrl: photoUrl, photoFileName: fileName }
          : r
      )
    );
  };

  const handleOpenDriveImagePicker = async () => {
    if (!user) {
      try {
        const res = await googleSignIn();
        if (res) {
          setUser(res.user);
          setIsDriveModalOpen(true);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      setIsDriveModalOpen(true);
    }
  };


  return (
    <div className="bg-slate-100 text-slate-800 min-h-screen flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-slate-900 text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap justify-between items-center gap-3">
          {/* Logo & Brand Title */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setCurrentView('main')}
          >
            <div className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight">
                  해외 B2B 고객사별 스티커 부착 가이드
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  표준 SOP
                </span>
              </div>
              <p className="text-xs text-slate-400">
                수출 패킹 시 고객사별 지정 라벨 규격 및 부착 위치 실시간 안내 시스템
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center flex-wrap gap-2">
            {/* If in guide view, show '메인 전체표 보기' button */}
            {currentView === 'guide' && (
              <button
                type="button"
                onClick={() => setCurrentView('main')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition shadow-sm cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>메인 전체표 보기</span>
              </button>
            )}

            {/* Google Drive Auth & Sync Button */}
            <GoogleAuthButton
              user={user}
              onAuthChange={(u) => setUser(u)}
              onOpenDriveModal={() => setIsDriveModalOpen(true)}
            />

            {/* PWA / Mobile Install Button */}
            <PWAInstallButton />

            {/* Template Download */}
            <button
              type="button"
              onClick={downloadExcelTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
              title="엑셀 표준 양식 다운로드"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">양식 다운</span>
            </button>

            {/* Excel Upload */}
            <label className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm active:scale-95">
              <FileUp className="w-3.5 h-3.5" />
              <span>엑셀 업로드</span>
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleUploadExcel}
                className="hidden"
              />
            </label>

            {/* Reset */}
            <button
              type="button"
              onClick={handleResetDefault}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
              title="기본 표준 데이터로 초기화"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full space-y-6">
        {/* ========================================================
            VIEW 1: MAIN LANDING PAGE (Hero Title + Full Excel Table)
            ======================================================== */}
        {currentView === 'main' ? (
          <div className="space-y-6">
            {/* Big Hero Header Card */}
            <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-7 sm:p-10 rounded-3xl shadow-md relative overflow-hidden">
              <div className="relative z-10 max-w-3xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>해외 B2B 물류 출고 검수 포털</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                  해외 B2B 고객사별 스티커 부착 가이드
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  해외 B2B 수출 패킹 시 고객사별 지정 라벨 규격, 부착 위치(앞/뒤), 바코드 가림 여부 및 실물 사진을 안내하는 공식 표준 매뉴얼입니다. 아래 목록에서 <strong className="text-white underline underline-offset-2">[가이드 보기]</strong>를 클릭하여 상세 부착 지침 및 사진을 확인하세요.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (!user) {
                        handleOpenDriveImagePicker();
                      } else {
                        setIsDriveModalOpen(true);
                      }
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    <HardDrive className="w-4 h-4" />
                    <span>Google Drive 가이드 동기화 & 파일 탐색</span>
                  </button>
                  <span className="text-xs text-slate-400 hidden sm:inline">
                    Drive의 엑셀/시트 가이드 및 라벨 사진을 실시간으로 가져오거나 백업할 수 있습니다.
                  </span>
                </div>
              </div>

              {/* Decorative background aura */}
              <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-500/10 to-transparent pointer-events-none" />
            </section>

            {/* Full Excel Table right below the Hero */}
            <section>
              <ExcelTableView
                guides={guideRules}
                onSelectBuyer={handleOpenGuide}
              />
            </section>
          </div>
        ) : (
          /* ========================================================
             VIEW 2: CUSTOMER GUIDE TUTORIAL VIEW
             ======================================================== */
          <div className="space-y-6">
            {/* Back Button & Customer Tabs Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <button
                type="button"
                onClick={() => setCurrentView('main')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>← 전체 엑셀표(메인)로 돌아가기</span>
              </button>

              <div className="flex items-center gap-1 text-xs text-slate-500">
                <span>단축키: <strong>[Esc]</strong> 전체 목록 / <strong>[← / →]</strong> 고객사 이동</span>
              </div>
            </div>

            {/* Quick Customer Select Pills */}
            <section className="bg-white p-4 sm:p-5 rounded-3xl shadow-sm border border-slate-200">
              <BuyerSelector
                guides={guideRules}
                selectedBuyer={selectedBuyer}
                onSelectBuyer={(buyer) => {
                  setSelectedBuyer(buyer);
                }}
              />
            </section>

            {/* Active Customer's Tutorial Card View */}
            <section>
              <TutorialCardView
                guide={activeGuide}
                currentIndex={currentIndex >= 0 ? currentIndex : 0}
                totalCount={guideRules.length}
                onPrev={handlePrev}
                onNext={handleNext}
                onUploadStickerPhoto={handleUploadStickerPhoto}
                onUploadAttachedPhoto={handleUploadAttachedPhoto}
                onOpenDriveImagePicker={handleOpenDriveImagePicker}
              />
            </section>

            {/* Bottom Return Bar */}
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setCurrentView('main');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-300 rounded-2xl text-xs font-black transition shadow-sm cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>전체 엑셀표(메인 페이지)로 돌아가기</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3.5 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-between items-center gap-2">
          <span>해외 B2B 고객사별 스티커 부착 가이드 &copy; 2026</span>
          <div className="flex items-center gap-3">
            <span className="font-medium text-slate-500">
              {currentView === 'main'
                ? '고객사 행의 [가이드 보기]를 누르면 상세 가이드로 이동합니다'
                : '키보드 좌/우 방향키(← / →)로 고객사를 연속 탐색할 수 있습니다'}
            </span>
          </div>
        </div>
      </footer>

      {/* Guideline Editor Modal (if opened) */}
      <GuidelineModal
        isOpen={isGuidelineModalOpen}
        onClose={() => setIsGuidelineModalOpen(false)}
        guides={guideRules}
        onSaveGuides={(newGuides) => setGuideRules(newGuides)}
        onSelectBuyer={(buyer) => {
          setSelectedBuyer(buyer);
          setCurrentView('guide');
        }}
      />

      {/* Google Drive Integration Modal */}
      <GoogleDriveModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        guides={guideRules}
        activeBuyer={selectedBuyer}
        onApplyGuides={handleApplyGuidesFromDrive}
        onApplyStickerPhoto={handleApplyStickerPhotoFromDrive}
        onApplyAttachedPhoto={handleApplyAttachedPhotoFromDrive}
      />
    </div>
  );
}
