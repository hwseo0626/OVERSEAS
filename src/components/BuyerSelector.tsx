import React from 'react';
import { GuideRule } from '../types';
import { Layers, AlertTriangle, Camera, CheckCircle2 } from 'lucide-react';

interface BuyerSelectorProps {
  guides: GuideRule[];
  selectedBuyer: string;
  onSelectBuyer: (buyer: string) => void;
}

export const BuyerSelector: React.FC<BuyerSelectorProps> = ({
  guides,
  selectedBuyer,
  onSelectBuyer,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
          고객사 선택 (클릭하여 부착 가이드 확인)
        </span>
        <span className="text-xs text-slate-400 font-medium">
          총 {guides.length}개 고객사
        </span>
      </div>

      {/* Grid / Horizontal scrolling tabs for buyers */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {guides.map((guide, idx) => {
          const isSelected = guide.buyer === selectedBuyer;
          const isCovering = guide.handling.includes('가림') || guide.handling.includes('덮어');
          const isFront = guide.side === '앞';
          const isWaitingPhoto = !guide.hasRealPhoto && !guide.photoUrl;

          return (
            <button
              key={guide.id || guide.buyer}
              type="button"
              onClick={() => onSelectBuyer(guide.buyer)}
              className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between group ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-blue-500 ring-offset-2'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-blue-400 hover:shadow-sm'
              }`}
            >
              {/* Top Row: Index & Warning / Status Icon */}
              <div className="flex items-center justify-between w-full mb-2">
                <span
                  className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                    isSelected ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  0{idx + 1}
                </span>

                {isCovering ? (
                  <span
                    className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isSelected
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-rose-100 text-rose-700 border border-rose-200'
                    }`}
                  >
                    <AlertTriangle className="w-2.5 h-2.5" />
                    가림
                  </span>
                ) : isWaitingPhoto ? (
                  <span
                    className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-amber-100 text-amber-700 border border-amber-200'
                    }`}
                  >
                    <Camera className="w-2.5 h-2.5" />
                    촬영대기
                  </span>
                ) : (
                  <span
                    className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    등록완료
                  </span>
                )}
              </div>

              {/* Center: Buyer Name */}
              <div>
                <h3
                  className={`text-base font-black tracking-tight truncate ${
                    isSelected ? 'text-white' : 'text-slate-900 group-hover:text-blue-600'
                  }`}
                >
                  {guide.buyer}
                </h3>
                <p
                  className={`text-[11px] font-medium mt-0.5 truncate ${
                    isSelected ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  {guide.stickerSize}
                </p>
              </div>

              {/* Bottom Tag: Position */}
              <div className="mt-3 pt-2 border-t border-slate-100/20 flex items-center justify-between text-[10px] font-bold">
                <span
                  className={
                    isSelected
                      ? isFront
                        ? 'text-rose-400'
                        : 'text-indigo-400'
                      : isFront
                      ? 'text-rose-600'
                      : 'text-indigo-600'
                  }
                >
                  <Layers className="w-3 h-3 inline mr-1" />
                  {isFront ? '패키지 앞면' : '패키지 뒷면'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
