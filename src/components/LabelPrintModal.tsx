import React, { useState } from 'react';
import { ActiveGuideState } from '../types';
import { X, Printer, Check, Copy } from 'lucide-react';

interface LabelPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeGuide: ActiveGuideState;
}

export const LabelPrintModal: React.FC<LabelPrintModalProps> = ({
  isOpen,
  onClose,
  activeGuide,
}) => {
  const [printCopies, setPrintCopies] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const { buyer, name, barcode, sku, rule } = activeGuide;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyBarcode = () => {
    navigator.clipboard.writeText(barcode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <Printer className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-base font-bold">라벨 출력 규격 시뮬레이터</h2>
              <p className="text-xs text-slate-400">
                {buyer} 전용 라벨 규격 ({rule.stickerSize}) 미리보기 및 테스트 인쇄
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {/* Label Spec Callout */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                출력 방식 안내
              </span>
              <p className="text-sm font-bold text-slate-800 whitespace-pre-line mt-0.5">
                {rule.printMethod}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-600">인쇄 수량:</label>
              <input
                type="number"
                min={1}
                max={100}
                value={printCopies}
                onChange={(e) => setPrintCopies(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-center"
              />
            </div>
          </div>

          {/* Physical Label Sheet Simulation */}
          <div className="flex flex-col items-center justify-center p-8 bg-slate-100 rounded-2xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 mb-3">
              [실제 라벨 인쇄 크기 시뮬레이션]
            </span>

            {/* Simulated Label Sticker Box */}
            <div
              className={`bg-white rounded-lg border-2 border-slate-800 p-4 shadow-md flex flex-col justify-between transition-all ${
                rule.stickerSize.includes('65')
                  ? 'w-[280px] h-[190px]' // 65x44 ratio
                  : rule.stickerSize.includes('45')
                  ? 'w-[240px] h-[180px]' // 45x35 ratio
                  : 'w-[260px] h-[150px]' // common sticker
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b pb-2 border-slate-200">
                <div>
                  <span className="text-[11px] font-black tracking-widest text-blue-700 uppercase">
                    {buyer}
                  </span>
                  <p className="text-xs font-bold text-slate-900 line-clamp-1">{name}</p>
                </div>
                <span className="text-[10px] font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">
                  {rule.stickerSize}
                </span>
              </div>

              {/* Barcode Graphic */}
              <div className="flex flex-col items-center justify-center my-2">
                <div className="flex items-center gap-[2px] h-10 w-full justify-center">
                  {[3, 1, 4, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 3, 1, 4, 2, 1, 3, 1, 2, 3].map(
                    (w, i) => (
                      <div
                        key={i}
                        className="bg-black h-full"
                        style={{ width: `${w * 1.5}px` }}
                      />
                    )
                  )}
                </div>
                <span className="text-xs font-mono font-bold tracking-widest text-slate-800 mt-1">
                  {barcode}
                </span>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1 border-t border-slate-100">
                <span className="font-mono">SKU: {sku || 'N/A'}</span>
                <span>배송지/검수 완료</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-3 text-center">
              * 라벨 출력기에 용지를 장착하고 [테스트 인쇄] 버튼을 누르면 해당 규격으로 출력됩니다.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleCopyBarcode}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '바코드 복사완료' : '바코드 텍스트 복사'}</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>라벨 테스트 인쇄 ({printCopies}매)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
