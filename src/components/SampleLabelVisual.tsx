import React, { useState } from 'react';
import { GuideRule } from '../types';
import { Camera, Upload, ZoomIn, CheckCircle, AlertCircle } from 'lucide-react';

interface SampleLabelVisualProps {
  rule: GuideRule;
  itemName: string;
  barcode: string;
  sku: string;
  onUploadPhoto?: (file: File) => void;
}

export const SampleLabelVisual: React.FC<SampleLabelVisualProps> = ({
  rule,
  itemName,
  barcode,
  sku,
  onUploadPhoto,
}) => {
  const [showZoom, setShowZoom] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadPhoto) {
      onUploadPhoto(file);
    }
  };

  const isCoveringBarcode = rule.handling.includes('가림') || rule.handling.includes('덮어');

  return (
    <div className="space-y-3">
      {/* Photo status header badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">실물 라벨 규격 & 부착 시안</span>
          {rule.hasRealPhoto ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <CheckCircle className="w-3 h-3 text-emerald-600" />
              실부착 사진 매칭됨
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
              <Camera className="w-3 h-3 text-amber-600" />
              사진 촬영 대기 (미등록)
            </span>
          )}
        </div>

        {/* Upload / Change Photo Button */}
        <div className="flex items-center gap-1.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            type="button"
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            title="실물 사진 교체 또는 추가 등록"
          >
            <Upload className="w-3 h-3" />
            <span>사진 등록</span>
          </button>
        </div>
      </div>

      {/* Visual Sticker Card Container */}
      <div className="relative rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100 p-4 shadow-inner overflow-hidden">
        {/* If custom photoUrl exists, show it */}
        {rule.photoUrl ? (
          <div className="relative group rounded-lg overflow-hidden border border-slate-300 shadow-sm bg-white">
            <img
              src={rule.photoUrl}
              alt={`${rule.buyer} 실물 라벨 사진`}
              className="w-full h-44 object-cover object-center group-hover:scale-105 transition duration-300"
            />
            <button
              onClick={() => setShowZoom(true)}
              className="absolute bottom-2 right-2 p-1.5 bg-black/60 text-white rounded-lg opacity-80 group-hover:opacity-100 transition"
              title="크게 보기"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        ) : rule.hasRealPhoto ? (
          /* High-Fidelity Rendered Label Sticker mockup */
          <div className="bg-white rounded-lg border-2 border-slate-300 p-3.5 shadow-sm relative space-y-2">
            {/* Top Barcode simulation */}
            <div className="flex items-start justify-between border-b pb-2 border-slate-100">
              <div>
                <span className="text-[10px] font-black tracking-widest text-blue-700 uppercase">
                  {rule.buyer} LOGISTICS STICKER
                </span>
                <p className="text-xs font-bold text-slate-800 line-clamp-1">{itemName}</p>
                <p className="text-[10px] font-mono text-slate-400">SKU: {sku || 'SAMPLE-SKU'}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-mono">
                  {rule.stickerSize}
                </span>
              </div>
            </div>

            {/* Middle Barcode Simulation */}
            <div className="py-1 flex flex-col items-center justify-center bg-slate-50 rounded border border-dashed border-slate-200">
              <div className="h-9 w-44 flex items-center justify-between px-1 bg-white border border-slate-200">
                {/* SVG Barcode pattern */}
                <div className="w-full h-full flex items-center justify-center gap-[2px]">
                  {[3, 1, 4, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 3, 1, 4, 2, 1, 3, 1, 2, 3].map((w, i) => (
                    <div
                      key={i}
                      className="bg-slate-900 h-7"
                      style={{ width: `${w * 1.5}px` }}
                    />
                  ))}
                </div>
              </div>
              <span className="text-[9px] font-mono text-slate-600 tracking-widest mt-1">
                {barcode || '8801234567890'}
              </span>
            </div>

            {/* Bottom Disclaimer */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
              <span>Made in Korea / Overseas Standard</span>
              <span className="font-semibold text-slate-700">
                {isCoveringBarcode ? '⚠️ 바코드 덮어부착형' : '✅ 여백 부착형'}
              </span>
            </div>
          </div>
        ) : (
          /* Awaiting Real Photo Shoot placeholder (as in JARIR) */
          <div className="bg-amber-50/80 border-2 border-dashed border-amber-300 rounded-xl p-5 text-center flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shadow-inner">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900">실물 스티커 사진 촬영 대기 중</h4>
              <p className="text-[11px] text-amber-700 mt-0.5 max-w-xs mx-auto leading-relaxed">
                현재 실물 사진이 미등록되어 표준 가이드 그래픽으로 안내됩니다. 사진 촬영 후 [사진 등록] 버튼을 눌러 등록할 수 있습니다.
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold shadow-sm transition"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>지금 사진 촬영/업로드</span>
            </button>
          </div>
        )}

        {/* Warning pill if ROA or barcode covering */}
        {isCoveringBarcode && (
          <div className="mt-2.5 flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-lg p-2 text-rose-800 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>기존 상품 바코드 위에 정확하게 겹쳐서 가려 부착해야 합니다.</span>
          </div>
        )}
      </div>

      {/* Modal for Zoom */}
      {showZoom && rule.photoUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setShowZoom(false)}
        >
          <div
            className="max-w-2xl bg-white rounded-2xl overflow-hidden p-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 mb-3">
              <h3 className="text-sm font-bold text-slate-800">
                {rule.buyer} 실물 라벨 사진 확대
              </h3>
              <button
                onClick={() => setShowZoom(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold px-2"
              >
                ✕
              </button>
            </div>
            <img
              src={rule.photoUrl}
              alt={`${rule.buyer} 확대 사진`}
              className="w-full max-h-[70vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};
