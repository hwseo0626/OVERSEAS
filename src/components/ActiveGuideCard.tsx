import React from 'react';
import { ActiveGuideState } from '../types';
import { PackageBoxVisualizer } from './PackageBoxVisualizer';
import { SampleLabelVisual } from './SampleLabelVisual';
import {
  Layers,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Barcode as BarcodeIcon,
} from 'lucide-react';

interface ActiveGuideCardProps {
  guideState: ActiveGuideState | null;
  onComplete: () => void;
  onOpenLabelPrintModal: () => void;
  onUploadPhoto: (file: File) => void;
}

export const ActiveGuideCard: React.FC<ActiveGuideCardProps> = ({
  guideState,
  onComplete,
  onOpenLabelPrintModal,
  onUploadPhoto,
}) => {
  if (!guideState) {
    return (
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center relative overflow-hidden">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <BarcodeIcon className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">작업할 제품의 바코드를 스캔해 주세요</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
          바코드를 스캔하거나 상단에서 고객사를 선택하시면 해당 고객사의 표준 라벨 출력 규격, 바코드 가림 여부 및 패키지 부착 도식도가 즉시 표시됩니다.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs text-slate-400">
          <span className="px-2.5 py-1 bg-slate-100 rounded-lg font-mono">단축키: 바코드 입력 후 [Enter]</span>
          <span className="px-2.5 py-1 bg-slate-100 rounded-lg font-mono">검수 완료: [Space] 또는 [Enter]</span>
        </div>
      </section>
    );
  }

  const { buyer, name, barcode, sku, rule } = guideState;
  const isCoveringBarcode = rule.handling.includes('가림') || rule.handling.includes('덮어');
  const isFront = rule.side === '앞';

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 relative overflow-hidden transition-all">
      {/* Title & Badges Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-lg text-xs font-black bg-blue-100 text-blue-900 border border-blue-200 tracking-wider uppercase">
              {buyer}
            </span>
            <span
              className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                rule.stickerSize.includes('65') || rule.stickerSize.includes('45')
                  ? 'bg-purple-100 text-purple-900 border-purple-300'
                  : 'bg-amber-100 text-amber-900 border-amber-300'
              }`}
            >
              라벨 규격: {rule.stickerSize}
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-2 tracking-tight">{name}</h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Barcode: <strong className="text-slate-600">{barcode}</strong> | SKU:{' '}
            <strong className="text-slate-600">{sku || '-'}</strong>
          </p>
        </div>

        {/* Side Position Highlight Badge */}
        <div
          className={`px-4 py-2.5 rounded-xl text-sm font-extrabold flex items-center gap-2 shadow-sm ${
            isFront ? 'bg-rose-600 text-white' : 'bg-indigo-600 text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{isFront ? '패키지 앞면 부착' : '패키지 뒷면 부착'}</span>
        </div>
      </div>

      {/* Main Grid: Visual Package Diagram (Left) & Specs/Instructions (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start mt-6">
        {/* Left Column: Visual Package Diagram */}
        <div className="md:col-span-5">
          <PackageBoxVisualizer
            rule={rule}
            barcode={barcode}
            sku={sku}
            itemName={name}
          />
        </div>

        {/* Right Column: Specs Grid, Sample Label, Warning, Completion */}
        <div className="md:col-span-7 space-y-4">
          {/* Specifications Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 font-medium block">라벨 출력 규격</span>
              <span className="text-xs font-bold text-slate-900 break-words leading-snug whitespace-pre-line">
                {rule.printMethod}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 font-medium block">바코드 처리 방식</span>
              <span
                className={`text-xs font-extrabold leading-snug ${
                  isCoveringBarcode ? 'text-rose-600' : 'text-emerald-700'
                }`}
              >
                {rule.handling}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 font-medium block">부착 위치 구분</span>
              <span className="text-xs font-bold text-slate-900 leading-snug">{rule.pos}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 font-medium block">스티커 실물 사진 상태</span>
              <span
                className={`text-xs font-bold leading-snug ${
                  rule.hasRealPhoto ? 'text-emerald-600' : 'text-amber-600'
                }`}
              >
                {rule.hasRealPhoto ? '등록 완료' : '사진 촬영 대기'}
              </span>
            </div>
          </div>

          {/* Sample Label & Real Photo Section */}
          <SampleLabelVisual
            rule={rule}
            itemName={name}
            barcode={barcode}
            sku={sku}
            onUploadPhoto={onUploadPhoto}
          />

          {/* Warning / Special Notes Box */}
          <div
            className={`p-3.5 rounded-xl border flex gap-2.5 items-start ${
              isCoveringBarcode
                ? 'bg-rose-50 border-rose-200 text-rose-950'
                : 'bg-amber-50 border-amber-200 text-amber-950'
            }`}
          >
            <AlertTriangle
              className={`w-5 h-5 shrink-0 mt-0.5 ${
                isCoveringBarcode ? 'text-rose-600' : 'text-amber-600'
              }`}
            />
            <div className="w-full">
              <h4
                className={`text-xs font-black uppercase tracking-wider ${
                  isCoveringBarcode ? 'text-rose-800' : 'text-amber-800'
                }`}
              >
                특이사항 및 작업 주의점
              </h4>
              <p className="text-xs font-semibold mt-0.5 leading-relaxed whitespace-pre-line">
                {rule.notes || '특이사항 없음'}
              </p>
            </div>
          </div>

          {/* Action Button Row */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onOpenLabelPrintModal}
              className="px-3.5 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition"
              title="라벨 출력 규격 시뮬레이터"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">라벨 출력 테스트</span>
            </button>

            <button
              type="button"
              onClick={onComplete}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white py-3.5 rounded-xl font-black text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>패킹 및 라벨 확인 완료 (Space / Enter)</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
