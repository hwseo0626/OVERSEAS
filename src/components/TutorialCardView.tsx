import React, { useState, useRef } from 'react';
import { GuideRule } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  Printer,
  Layers,
  Copy,
  Check,
  Tag,
  FileText,
  Camera,
  Upload,
  ZoomIn,
  X,
  ShieldAlert,
  CheckCircle2,
  Image as ImageIcon,
  HardDrive,
} from 'lucide-react';

interface TutorialCardViewProps {
  guide: GuideRule;
  currentIndex: number;
  totalCount: number;
  onPrev: () => void;
  onNext: () => void;
  onUploadStickerPhoto: (file: File) => void;
  onUploadAttachedPhoto: (file: File) => void;
  onOpenDriveImagePicker?: (target: 'sticker' | 'attached') => void;
}

export const TutorialCardView: React.FC<TutorialCardViewProps> = ({
  guide,
  currentIndex,
  totalCount,
  onPrev,
  onNext,
  onUploadStickerPhoto,
  onUploadAttachedPhoto,
  onOpenDriveImagePicker,
}) => {
  const [copiedPrint, setCopiedPrint] = useState(false);
  const [zoomImage, setZoomImage] = useState<{ url: string; title: string } | null>(null);

  const stickerFileInputRef = useRef<HTMLInputElement>(null);
  const attachedFileInputRef = useRef<HTMLInputElement>(null);

  const isCoveringBarcode = guide.handling.includes('가림') || guide.handling.includes('덮어');
  const isFront = guide.side === '앞';
  const isWaitingAttachedPhoto = !guide.hasRealPhoto && !guide.photoUrl;

  const handleCopyPrint = () => {
    navigator.clipboard.writeText(guide.printMethod);
    setCopiedPrint(true);
    setTimeout(() => setCopiedPrint(false), 2000);
  };

  const handleStickerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadStickerPhoto(file);
      e.target.value = '';
    }
  };

  const handleAttachedFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadAttachedPhoto(file);
      e.target.value = '';
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Top Tutorial Step Bar */}
      <div className="bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-500 text-white tracking-wider">
            STEP {currentIndex + 1} / {totalCount}
          </span>
          <div>
            <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
              <span>{guide.buyer}</span>
              <span className="text-xs font-semibold text-slate-400">라벨 부착 튜토리얼</span>
            </h2>
          </div>
        </div>

        {/* Step Navigation Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrev}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">이전 고객사</span>
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1 px-2">
            {Array.from({ length: totalCount }).map((_, i) => (
              <span
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i === currentIndex ? 'w-5 bg-blue-500' : 'w-2 bg-slate-700'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition shadow-sm cursor-pointer"
          >
            <span className="hidden sm:inline">다음 고객사</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* Buyer Hero Header & Highlights */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg text-xs font-black bg-blue-100 text-blue-900 border border-blue-200 uppercase">
                {guide.buyer} 표준 규격
              </span>
              <span
                className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                  guide.stickerSize.includes('65') || guide.stickerSize.includes('45')
                    ? 'bg-purple-100 text-purple-900 border-purple-300'
                    : 'bg-amber-100 text-amber-900 border-amber-300'
                }`}
              >
                규격: {guide.stickerSize}
              </span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
              {guide.buyer} 패킹 라벨 작업 지침서
            </h3>
          </div>

          {/* Position Highlight Banner */}
          <div
            className={`px-5 py-3 rounded-2xl text-sm font-black flex items-center gap-2.5 shadow-md ${
              isFront
                ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-rose-500/20'
                : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-indigo-500/20'
            }`}
          >
            <Layers className="w-5 h-5" />
            <div>
              <span className="text-[10px] text-white/80 block uppercase font-mono">
                Attachment Side
              </span>
              <span>{isFront ? '패키지 앞면(전면) 부착' : '패키지 뒷면(후면) 부착'}</span>
            </div>
          </div>
        </div>

        {/* 1. PRIMARY FOCUS: 바코드 부착방식 (최우선 중요 항목) */}
        <div
          className={`p-4 sm:p-5 rounded-2xl border transition-all ${
            isCoveringBarcode
              ? 'bg-rose-50 border-rose-300 shadow-sm'
              : 'bg-emerald-50 border-emerald-300 shadow-sm'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div
                className={`p-2.5 rounded-xl shrink-0 ${
                  isCoveringBarcode
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {isCoveringBarcode ? (
                  <ShieldAlert className="w-6 h-6" />
                ) : (
                  <CheckCircle2 className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                      isCoveringBarcode
                        ? 'bg-rose-200 text-rose-900'
                        : 'bg-emerald-200 text-emerald-900'
                    }`}
                  >
                    최우선 검수 항목
                  </span>
                  <span className="text-xs font-bold text-slate-500">바코드 부착 방식</span>
                </div>
                <h4
                  className={`text-lg sm:text-xl font-black mt-1 ${
                    isCoveringBarcode ? 'text-rose-900' : 'text-emerald-900'
                  }`}
                >
                  {guide.handling}
                </h4>
                <p
                  className={`text-xs sm:text-sm font-semibold mt-0.5 leading-relaxed ${
                    isCoveringBarcode ? 'text-rose-700' : 'text-emerald-700'
                  }`}
                >
                  {isCoveringBarcode
                    ? '⚠️ [경고] 기존 제품 바코드를 완전히 덮어서 가려야 합니다 (바코드 리더기 혼선 방지 必)'
                    : '✅ [확인] 기존 제품 바코드를 가리지 않는 상단/중앙 여백에 부착해 주세요.'}
                </p>
              </div>
            </div>

            {/* Status tag */}
            <div className="shrink-0">
              <span
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black shadow-xs ${
                  isCoveringBarcode
                    ? 'bg-rose-600 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {isCoveringBarcode ? '바코드 완전 덮음' : '바코드 미은폐 (보존)'}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Secondary Row: 스티커 출력 방식 & 특이사항 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* 스티커 출력 방식 */}
          <div className="md:col-span-5 bg-gradient-to-br from-slate-50 to-blue-50/40 p-4 rounded-2xl border border-blue-100 shadow-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-blue-600" />
                스티커 출력 방식 (라벨 규격)
              </span>
              <button
                type="button"
                onClick={handleCopyPrint}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-white px-2 py-0.5 rounded-md border border-blue-200 transition cursor-pointer"
                title="출력 규격 복사"
              >
                {copiedPrint ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedPrint ? '복사됨' : '복사'}</span>
              </button>
            </div>
            <p className="text-sm font-extrabold text-slate-900 whitespace-pre-line leading-relaxed">
              {guide.printMethod}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-white/80 px-2 py-0.5 rounded border border-slate-200">
                <Tag className="w-3 h-3 text-slate-400" />
                규격: {guide.stickerSize}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-white/80 px-2 py-0.5 rounded border border-slate-200">
                <Layers className="w-3 h-3 text-slate-400" />
                부착면: {guide.pos}
              </span>
            </div>
          </div>

          {/* 특이사항 및 작업 주의점 */}
          <div
            className={`md:col-span-7 p-4 rounded-2xl border flex gap-3 items-start ${
              isCoveringBarcode
                ? 'bg-rose-50/70 border-rose-200'
                : 'bg-amber-50/70 border-amber-200'
            }`}
          >
            <div
              className={`p-2 rounded-xl shrink-0 ${
                isCoveringBarcode
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              <FileText className="w-5 h-5" />
            </div>
            <div className="w-full">
              <h4
                className={`text-xs font-black uppercase tracking-wider ${
                  isCoveringBarcode ? 'text-rose-900' : 'text-amber-900'
                }`}
              >
                특이사항 및 작업 주의점
              </h4>
              <p className="text-xs font-bold mt-1 leading-relaxed text-slate-800 whitespace-pre-line">
                {guide.notes || '별도 특이사항 없음'}
              </p>
            </div>
          </div>
        </div>

        {/* 3. TWO CRISP, WELL-PROPORTIONED COLUMNS (50% / 50%):
            - Column 1: 스티커 사진 (출력 라벨 규격) with dedicated upload
            - Column 2: 실부착 사진 (실물 패키지 부착 모습) with dedicated upload
            Reduced container size for sharp, high-DPI crisp display without excessive zoom!
        */}
        <div className="pt-1">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
            {/* COLUMN 1: 스티커 사진 (라벨 규격) */}
            <div className="flex flex-col bg-slate-50/90 rounded-2xl border border-slate-200 p-4 shadow-xs">
              {/* Header with Title & Upload Button */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-600" />
                  <h4 className="text-xs sm:text-sm font-black text-slate-900">
                    1. 스티커 사진 (출력 라벨 시안)
                  </h4>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                    {guide.stickerSize}
                  </span>
                </div>

                {/* Upload Sticker Photo Button */}
                <div className="flex items-center gap-1.5">
                  <input
                    type="file"
                    ref={stickerFileInputRef}
                    onChange={handleStickerFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => stickerFileInputRef.current?.click()}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-purple-700 bg-white hover:bg-purple-50 px-2.5 py-1 rounded-lg border border-slate-300 hover:border-purple-300 transition shadow-xs cursor-pointer"
                    title="스티커 라벨 사진 등록 또는 교체"
                  >
                    <Upload className="w-3 h-3" />
                    <span>사진 등록</span>
                  </button>
                  {onOpenDriveImagePicker && (
                    <button
                      type="button"
                      onClick={() => onOpenDriveImagePicker('sticker')}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg border border-blue-200 transition shadow-xs cursor-pointer"
                      title="Google Drive에서 스티커 사진 선택"
                    >
                      <HardDrive className="w-3 h-3" />
                      <span>Drive 선택</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Compact, Crisp Display Area */}
              <div className="flex-1 flex flex-col justify-center items-center bg-white rounded-xl border border-slate-200/80 p-3 h-64 sm:h-72 relative overflow-hidden group">
                {guide.stickerPhotoUrl ? (
                  /* User Uploaded Sticker Image (Sharp, natural scale) */
                  <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-50/60 rounded-lg p-2">
                    <img
                      src={guide.stickerPhotoUrl}
                      alt={`${guide.buyer} 스티커 라벨 사진`}
                      className="max-h-56 sm:max-h-64 w-auto max-w-full object-contain rounded-md shadow-xs transition duration-200 group-hover:scale-[1.01]"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setZoomImage({
                          url: guide.stickerPhotoUrl!,
                          title: `${guide.buyer} 스티커 라벨 사진`,
                        })
                      }
                      className="absolute bottom-2 right-2 inline-flex items-center gap-1 px-2 py-1 bg-black/75 hover:bg-black text-white text-[10px] font-bold rounded-lg shadow-md transition cursor-pointer"
                      title="크게 확대해서 보기"
                    >
                      <ZoomIn className="w-3 h-3" />
                      <span>확대 보기</span>
                    </button>
                  </div>
                ) : (
                  /* Realistic, Sharp Compact Label Mockup */
                  <div className="w-full h-full flex flex-col justify-center items-center p-1">
                    <div
                      className={`bg-white rounded-xl border border-slate-300 p-4 shadow-xs w-full max-w-[250px] space-y-2.5 transition-all ${
                        isCoveringBarcode
                          ? 'ring-2 ring-rose-400/30'
                          : 'ring-2 ring-emerald-400/30'
                      }`}
                    >
                      {/* Label Mockup Top */}
                      <div className="flex items-start justify-between border-b pb-1.5 border-slate-100">
                        <div>
                          <span className="text-[10px] font-black tracking-widest text-blue-700 uppercase">
                            {guide.buyer}
                          </span>
                          <p className="text-xs font-black text-slate-800 line-clamp-1">
                            {guide.buyer} 출고 라벨
                          </p>
                        </div>
                        <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                          {guide.stickerSize}
                        </span>
                      </div>

                      {/* Barcode Graphic Pattern - Crisp & Compact */}
                      <div className="py-2 px-1 flex flex-col items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                        <div className="h-8 w-full flex items-center justify-center gap-[2px] bg-white px-2 border border-slate-200 rounded">
                          {[3, 1, 4, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 3, 1, 4, 2, 1, 3, 1, 2, 3].map(
                            (w, i) => (
                              <div
                                key={i}
                                className="bg-slate-900 h-6"
                                style={{ width: `${w * 1.3}px` }}
                              />
                            )
                          )}
                        </div>
                        <span className="text-[9px] font-mono text-slate-700 font-bold tracking-widest mt-1">
                          8801234567890
                        </span>
                      </div>

                      {/* Footer Info */}
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                        <span className="truncate max-w-[120px]">{guide.printMethod.split('\n')[0]}</span>
                        <span
                          className={`font-black shrink-0 ${
                            isCoveringBarcode ? 'text-rose-600' : 'text-emerald-700'
                          }`}
                        >
                          {isCoveringBarcode ? '바코드 가림용' : '여백 부착용'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 text-center">
                      <button
                        type="button"
                        onClick={() => stickerFileInputRef.current?.click()}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-600 hover:text-purple-800 hover:underline cursor-pointer"
                      >
                        <ImageIcon className="w-3 h-3" />
                        <span>실제 라벨 사진 등록하기</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* COLUMN 2: 실부착 사진 (실물 패키지 부착 모습) */}
            <div className="flex flex-col bg-slate-50/90 rounded-2xl border border-slate-200 p-4 shadow-xs">
              {/* Header with Title & Upload Button */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-600" />
                  <h4 className="text-xs sm:text-sm font-black text-slate-900">
                    2. 실부착 사진 (패키지 부착 모습)
                  </h4>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      isFront
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                    }`}
                  >
                    {guide.pos}
                  </span>
                </div>

                {/* Upload Attached Photo Button */}
                <div className="flex items-center gap-1.5">
                  <input
                    type="file"
                    ref={attachedFileInputRef}
                    onChange={handleAttachedFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => attachedFileInputRef.current?.click()}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-emerald-700 bg-white hover:bg-emerald-50 px-2.5 py-1 rounded-lg border border-slate-300 hover:border-emerald-300 transition shadow-xs cursor-pointer"
                    title="실부착 사진 등록 또는 교체"
                  >
                    <Upload className="w-3 h-3" />
                    <span>사진 등록</span>
                  </button>
                  {onOpenDriveImagePicker && (
                    <button
                      type="button"
                      onClick={() => onOpenDriveImagePicker('attached')}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg border border-blue-200 transition shadow-xs cursor-pointer"
                      title="Google Drive에서 실부착 사진 선택"
                    >
                      <HardDrive className="w-3 h-3" />
                      <span>Drive 선택</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Compact, Crisp Display Area */}
              <div className="flex-1 flex flex-col justify-center items-center bg-white rounded-xl border border-slate-200/80 p-3 h-64 sm:h-72 relative overflow-hidden group">
                {guide.photoUrl ? (
                  /* User Uploaded Real Attached Package Photo (Sharp, natural scale) */
                  <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-50/60 rounded-lg p-2">
                    <img
                      src={guide.photoUrl}
                      alt={`${guide.buyer} 실부착 사진`}
                      className="max-h-56 sm:max-h-64 w-auto max-w-full object-contain rounded-md shadow-xs transition duration-200 group-hover:scale-[1.01]"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setZoomImage({
                          url: guide.photoUrl!,
                          title: `${guide.buyer} 실부착 패키지 사진`,
                        })
                      }
                      className="absolute bottom-2 right-2 inline-flex items-center gap-1 px-2 py-1 bg-black/75 hover:bg-black text-white text-[10px] font-bold rounded-lg shadow-md transition cursor-pointer"
                      title="크게 확대해서 보기"
                    >
                      <ZoomIn className="w-3 h-3" />
                      <span>확대 보기</span>
                    </button>
                  </div>
                ) : !isWaitingAttachedPhoto ? (
                  /* Standard Real Photo Preview - Compact, Crisp Package */
                  <div className="w-full h-full flex flex-col justify-between items-center p-2 relative">
                    <div className="w-full flex items-center justify-between text-[10px] text-slate-400 font-mono border-b pb-1">
                      <span>PACKAGE SAMPLE</span>
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        {guide.photoFileName || `${guide.buyer.toLowerCase()}_sample.png`}
                      </span>
                    </div>

                    {/* Realistic Product Package Graphic Simulation - Compact & Sharp */}
                    <div className="my-auto flex flex-col items-center justify-center">
                      <div className="w-36 sm:w-40 h-44 sm:h-48 bg-gradient-to-b from-slate-50 to-slate-100 rounded-xl border border-slate-300 shadow-xs relative flex flex-col justify-between p-2 select-none">
                        {/* Top Euro Hole */}
                        <div className="w-full flex flex-col items-center">
                          <div className="w-10 h-2 bg-slate-200 rounded-full border border-slate-300" />
                          <span className="text-[8px] font-mono text-slate-400 mt-0.5 uppercase font-bold">
                            {isFront ? '패키지 전면 (FRONT)' : '패키지 후면 (BACK)'}
                          </span>
                        </div>

                        {/* Middle Window or Attachment Target */}
                        {isFront ? (
                          <div className="my-auto flex flex-col items-center justify-center w-full">
                            <div className="w-28 h-16 border border-dashed border-slate-300 rounded-lg bg-white/70 flex items-center justify-center text-center p-1 mb-1">
                              <span className="text-[9px] text-slate-400 font-medium">
                                제품 진열창
                              </span>
                            </div>
                            <div className="w-28 py-1 rounded-lg bg-rose-50 border border-rose-400 text-center shadow-xs">
                              <span className="text-[9px] font-black text-rose-700 block">
                                ★ {guide.buyer} 스티커
                              </span>
                              <span className="text-[8px] font-bold text-rose-600 font-mono">
                                {guide.stickerSize}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="my-auto flex flex-col justify-between h-32 w-full">
                            {/* If back and NOT covering barcode -> sticker on top */}
                            {!isCoveringBarcode && (
                              <div className="w-28 mx-auto py-1 px-1 rounded-lg bg-emerald-50 border border-emerald-500 text-center shadow-xs">
                                <span className="text-[9px] font-black text-emerald-800 block">
                                  {guide.buyer} 스티커
                                </span>
                                <span className="text-[8px] font-bold text-emerald-600">
                                  상단 여백 부착 ({guide.stickerSize})
                                </span>
                              </div>
                            )}

                            {/* Original Manufacturer Barcode Box */}
                            <div className="w-28 mx-auto py-1 bg-white border border-slate-300 rounded flex flex-col items-center justify-center relative mt-auto shadow-inner">
                              <div className="flex items-center gap-[1px] h-3">
                                {[2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2].map((w, i) => (
                                  <div key={i} className="bg-slate-400 h-full" style={{ width: `${w}px` }} />
                                ))}
                              </div>
                              <span className="text-[7px] font-mono text-slate-400">
                                기존 바코드
                              </span>

                              {/* If covering barcode -> target sticker overlays on top! */}
                              {isCoveringBarcode && (
                                <div className="absolute inset-0 bg-rose-50 border border-rose-500 rounded flex flex-col items-center justify-center text-center shadow-xs">
                                  <span className="text-[8px] font-black text-rose-700 leading-tight">
                                    ⚠️ {guide.buyer} 라벨
                                  </span>
                                  <span className="text-[7px] font-black text-rose-600 bg-white/90 px-1 rounded">
                                    바코드 완벽 가림
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="text-center pt-0.5 border-t border-slate-200">
                          <span className="text-[8px] font-bold text-slate-500">
                            {isFront ? '패키지 전면 부착' : isCoveringBarcode ? '바코드 덮어부착' : '상단 여백 부착'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="w-full text-center pt-1 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">실물 패키지 예시</span>
                      <button
                        type="button"
                        onClick={() => attachedFileInputRef.current?.click()}
                        className="text-emerald-700 hover:text-emerald-900 font-bold hover:underline cursor-pointer"
                      >
                        사진 등록/교체
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Awaiting Photo Shoot placeholder (JARIR) */
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 space-y-2">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-inner">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-amber-900">
                        실물 스티커 사진 촬영 대기 중
                      </h5>
                      <p className="text-[11px] text-amber-700 mt-0.5 max-w-[200px] mx-auto leading-relaxed">
                        촬영 후 우측 상단의 <strong>[사진 등록]</strong>을 눌러 업로드해 주세요.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => attachedFileInputRef.current?.click()}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-black shadow-xs transition cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>사진 업로드</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Next Step Button */}
        <div className="pt-2 flex justify-end border-t border-slate-100">
          <button
            type="button"
            onClick={onNext}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-sm font-black shadow-md transition cursor-pointer"
          >
            <span>다음 고객사 확인하기 ({currentIndex + 1 < totalCount ? `${totalCount - currentIndex - 1}개 남음` : '처음으로'})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modal for Photo Full Zoom */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setZoomImage(null)}
        >
          <div
            className="max-w-4xl max-h-[90vh] bg-white rounded-3xl overflow-hidden p-5 relative flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-base font-black text-slate-900">
                {zoomImage.title} (고해상도 원본 보기)
              </h3>
              <button
                type="button"
                onClick={() => setZoomImage(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-auto flex items-center justify-center bg-slate-50 rounded-2xl p-2">
              <img
                src={zoomImage.url}
                alt={zoomImage.title}
                className="max-w-full max-h-[75vh] object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
