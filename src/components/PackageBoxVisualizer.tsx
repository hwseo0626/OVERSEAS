import React, { useState, useEffect } from 'react';
import { GuideRule } from '../types';
import { Eye, ShieldAlert, CheckCircle2, RotateCw } from 'lucide-react';

interface PackageBoxVisualizerProps {
  rule: GuideRule;
  barcode: string;
  sku: string;
  itemName: string;
}

export const PackageBoxVisualizer: React.FC<PackageBoxVisualizerProps> = ({
  rule,
  barcode,
  sku,
}) => {
  // Current active view: defaults to rule's designated side
  const [activeSide, setActiveSide] = useState<'앞' | '뒤'>(rule.side);
  const [is3DMode, setIs3DMode] = useState<boolean>(false);

  useEffect(() => {
    setActiveSide(rule.side);
  }, [rule.side, rule.id]);

  const isFront = activeSide === '앞';
  const isRuleSide = activeSide === rule.side;
  const isCoveringBarcode = rule.handling.includes('가림') || rule.handling.includes('덮어');

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
      {/* Top Header & Controls */}
      <div className="w-full flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-700">패키지 부착 도식도</span>
          <span
            className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
              rule.side === '앞'
                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
            }`}
          >
            기준 부착면: {rule.side}면
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Front / Back Toggle Buttons */}
          <div className="flex bg-slate-200/80 p-0.5 rounded-lg text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveSide('앞')}
              className={`px-2 py-1 rounded-md transition ${
                activeSide === '앞'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              앞면
            </button>
            <button
              type="button"
              onClick={() => setActiveSide('뒤')}
              className={`px-2 py-1 rounded-md transition ${
                activeSide === '뒤'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              뒷면
            </button>
          </div>

          {/* 3D Tilt button */}
          <button
            type="button"
            onClick={() => setIs3DMode(!is3DMode)}
            className={`p-1.5 rounded-lg border text-xs font-semibold transition ${
              is3DMode
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
            }`}
            title="3D 입체 각도 토글"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Package Box Graphic Area */}
      <div className="py-2 flex items-center justify-center w-full min-h-[300px] perspective-800">
        <div
          className={`relative w-52 h-72 bg-white rounded-2xl border-2 border-slate-300 shadow-lg transition-transform duration-500 flex flex-col justify-between p-3 select-none ${
            is3DMode ? 'rotate-y-12 rotate-x-6 shadow-2xl' : ''
          }`}
          style={{
            transformStyle: 'preserve-3d',
            backgroundImage:
              'radial-gradient(#e2e8f0 0.8px, transparent 0.8px), radial-gradient(#e2e8f0 0.8px, #ffffff 0.8px)',
            backgroundSize: '16px 16px',
            backgroundPosition: '0 0, 8px 8px',
          }}
        >
          {/* Top Hanging Hole (Euro Slot) */}
          <div className="w-full flex flex-col items-center">
            <div className="w-16 h-3 bg-slate-100 rounded-full border border-slate-300 flex items-center justify-center">
              <div className="w-4 h-1.5 bg-slate-300 rounded-full" />
            </div>
            <span className="text-[8px] font-mono font-bold text-slate-400 mt-0.5 uppercase tracking-wider">
              {isFront ? '패키지 전면 (FRONT)' : '패키지 후면 (BACK)'}
            </span>
          </div>

          {/* Front Side View Content */}
          {isFront && (
            <div className="flex-1 flex flex-col items-center justify-center relative">
              {/* Product Window Outline */}
              <div className="w-36 h-40 border border-slate-200 rounded-xl bg-slate-50/50 flex flex-col items-center justify-center p-2 text-center">
                <span className="text-[10px] text-slate-400 font-semibold mb-1">
                  제품 진열 윈도우
                </span>
                <span className="text-[9px] text-slate-300 font-mono">투명 필름</span>
              </div>

              {/* If rule specifies Front (TAICHEONG) */}
              {rule.side === '앞' && (
                <div
                  className="absolute w-36 h-12 rounded-lg bg-red-500/15 border-2 border-red-500 label-target-box-danger shadow-lg flex flex-col items-center justify-center p-1 cursor-pointer transition-all"
                  style={{ top: '40%' }}
                >
                  <span className="text-[10px] font-black text-red-700 uppercase">
                    ★ {rule.buyer} 스티커
                  </span>
                  <span className="text-[9px] font-bold text-red-600 font-mono">
                    {rule.stickerSize}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Back Side View Content */}
          {!isFront && (
            <div className="flex-1 flex flex-col justify-between relative mt-1 mb-1">
              {/* Upper Section Info Area */}
              <div className="w-full flex items-center justify-between text-[8px] text-slate-400 px-1 border-b border-slate-100 pb-1">
                <span>SPEC / MODEL</span>
                <span className="font-mono">{sku || 'SKU-001'}</span>
              </div>

              {/* Original Manufacturer Barcode Area (at lower section of back) */}
              <div className="w-36 h-12 bg-slate-100 border border-slate-300 rounded-md mx-auto flex flex-col items-center justify-center p-1 relative shadow-inner">
                <div className="flex items-center gap-[1.5px] h-4">
                  {[2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 2, 3, 1, 2, 4, 1].map((w, i) => (
                    <div key={i} className="bg-slate-400 h-full" style={{ width: `${w}px` }} />
                  ))}
                </div>
                <span className="text-[8px] font-mono text-slate-400 tracking-wider">
                  기존 바코드: {barcode || '8801234567890'}
                </span>

                {/* Overlaid X or Warning if ROA covers it */}
                {rule.side === '뒤' && isCoveringBarcode && (
                  <div className="absolute inset-0 bg-red-100/60 rounded flex items-center justify-center pointer-events-none">
                    <span className="text-[9px] font-black text-red-600 bg-white/90 px-1 rounded shadow-xs">
                      덮어서 가림 대상
                    </span>
                  </div>
                )}
              </div>

              {/* Target Sticker (Back Side) */}
              {rule.side === '뒤' && (
                <div
                  className={`absolute left-1/2 -translate-x-1/2 w-40 rounded-lg shadow-md flex flex-col items-center justify-center p-1.5 transition-all cursor-pointer ${
                    isCoveringBarcode
                      ? 'h-14 bg-rose-50 border-2 border-rose-500 label-target-box-danger'
                      : 'h-14 bg-emerald-50 border-2 border-emerald-500 label-target-box-safe'
                  }`}
                  style={{
                    top: isCoveringBarcode ? '58%' : '14%',
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-[10px] font-black ${
                        isCoveringBarcode ? 'text-rose-700' : 'text-emerald-800'
                      }`}
                    >
                      {rule.buyer} {rule.stickerSize}
                    </span>
                  </div>
                  <span
                    className={`text-[8.5px] font-bold ${
                      isCoveringBarcode ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {isCoveringBarcode ? '⚠️ 기존 바코드 완전 은폐' : '✅ 상단 여백 부착'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Bottom Edge */}
          <div className="text-center pt-1 border-t border-slate-100">
            <span className="text-[7.5px] text-slate-400">
              PACKAGE DIMENSION / AI LABEL GUIDE
            </span>
          </div>
        </div>
      </div>

      {/* Guide Instruction Caption under the box */}
      <div className="mt-3 w-full">
        {isRuleSide ? (
          rule.side === '앞' ? (
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 py-1.5 px-3 rounded-xl text-center">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
              <span>★ 패키지 전면(앞면) 지정 위치에 스티커 부착</span>
            </div>
          ) : isCoveringBarcode ? (
            <div className="flex items-center justify-center gap-1.5 text-xs font-black text-rose-800 bg-rose-50 border border-rose-200 py-1.5 px-3 rounded-xl text-center">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 animate-bounce" />
              <span>[경고] 기존 제품 바코드를 완전히 덮어서 가려야 함 (스캔 방지)</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 py-1.5 px-3 rounded-xl text-center">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>[확인] 기존 바코드를 가리지 않는 상단/중앙 여백 부착</span>
            </div>
          )
        ) : (
          <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 py-1.5 px-3 rounded-xl text-center">
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>
              현재 <strong>{activeSide}면</strong>을 보고 있습니다. 실제 부착면은{' '}
              <strong className="text-blue-600">{rule.side}면</strong>입니다.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
