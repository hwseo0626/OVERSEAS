import React, { useRef } from 'react';
import {
  PackageCheck,
  FileUp,
  RotateCcw,
  Volume2,
  VolumeX,
  FileSpreadsheet,
  BookOpen,
  Package,
} from 'lucide-react';
import { downloadExcelTemplate } from '../utils/excel';

interface NavbarProps {
  guideCount: number;
  itemCount: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onUploadExcel: (file: File) => void;
  onResetDefault: () => void;
  onOpenGuidesModal: () => void;
  onOpenItemsModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  guideCount,
  itemCount,
  isMuted,
  onToggleMute,
  onUploadExcel,
  onResetDefault,
  onOpenGuidesModal,
  onOpenItemsModal,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadExcel(file);
      e.target.value = ''; // reset so same file can be uploaded again if needed
    }
  };

  return (
    <header className="bg-slate-900 text-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap justify-between items-center gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-md shadow-blue-500/20">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight">해외물류 라벨 스티커 부착 가이드</h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                PROD v2.0
              </span>
            </div>
            <p className="text-xs text-slate-400">
              고객사별 라벨 출력 규격 및 부착 위치 실시간 안내 & 패킹 검수 시스템
            </p>
          </div>
        </div>

        {/* Right Badges & Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Status Badges */}
          <button
            type="button"
            onClick={onOpenGuidesModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-300 transition"
            title="고객사 가이드 규칙 목록 보기"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span>가이드</span>
            <span className="font-black text-white">{guideCount}</span>건
          </button>

          <button
            type="button"
            onClick={onOpenItemsModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-300 transition"
            title="등록된 출고 품목 마스터 보기"
          >
            <Package className="w-3.5 h-3.5 text-emerald-400" />
            <span>품목</span>
            <span className="font-black text-white">{itemCount}</span>건
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={onToggleMute}
            className={`p-2 rounded-xl text-xs font-bold transition border ${
              isMuted
                ? 'bg-rose-950/40 border-rose-800 text-rose-300 hover:bg-rose-900/50'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title={isMuted ? '음소거 해제 (사운드 켜기)' : '음소거 (사운드 끄기)'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Template Download */}
          <button
            type="button"
            onClick={downloadExcelTemplate}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
            title="엑셀 표준 양식 다운로드"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">양식 다운</span>
          </button>

          {/* Excel Upload Button */}
          <label className="cursor-pointer bg-blue-600 hover:bg-blue-500 active:scale-95 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm">
            <FileUp className="w-4 h-4" />
            <span>엑셀 업로드</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {/* Reset to Default Standard Data */}
          <button
            type="button"
            onClick={onResetDefault}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            title="기본 표준 데이터로 초기화"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
