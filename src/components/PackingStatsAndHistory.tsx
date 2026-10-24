import React, { useState } from 'react';
import { PackingHistoryItem } from '../types';
import {
  History,
  Trash2,
  Download,
  RotateCcw,
  Search,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { exportPackingHistoryToExcel } from '../utils/excel';

interface PackingStatsAndHistoryProps {
  history: PackingHistoryItem[];
  completedCount: number;
  lastBuyer: string;
  onClearHistory: () => void;
  onUndoLast: () => void;
  onSelectHistoryItem: (item: PackingHistoryItem) => void;
}

export const PackingStatsAndHistory: React.FC<PackingStatsAndHistoryProps> = ({
  history,
  completedCount,
  lastBuyer,
  onClearHistory,
  onUndoLast,
  onSelectHistoryItem,
}) => {
  const [filterText, setFilterText] = useState('');

  const filteredHistory = history.filter(
    (item) =>
      item.buyer.toLowerCase().includes(filterText.toLowerCase()) ||
      item.name.toLowerCase().includes(filterText.toLowerCase()) ||
      item.barcode.includes(filterText) ||
      item.sku.toLowerCase().includes(filterText.toLowerCase())
  );

  // Group by buyer for quick summary
  const buyerCounts = history.reduce<Record<string, number>>((acc, item) => {
    acc[item.buyer] = (acc[item.buyer] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Packing Stats Summary Card */}
      <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <div className="grid grid-cols-2 gap-4 text-center divide-x divide-slate-100">
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-1 flex items-center justify-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              오늘 완료 수량
            </span>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-black text-slate-900 tracking-tight">
                {completedCount}
              </span>
              <span className="text-xs font-bold text-slate-400">EA</span>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-1">
              직전 작업 바이어
            </span>
            <span className="text-base font-black text-blue-600 block truncate px-2 leading-10">
              {lastBuyer || '-'}
            </span>
          </div>
        </div>

        {/* Buyer Distribution Badges */}
        {Object.keys(buyerCounts).length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 block mb-1.5">
              고객사별 완료 통계:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(buyerCounts).map(([buyer, count]) => (
                <span
                  key={buyer}
                  className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200"
                >
                  {buyer} <span className="text-blue-600 ml-0.5">{count}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* History List Card */}
      <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <History className="w-4 h-4 text-slate-400" />
            <span>최근 작업 내역 ({history.length}건)</span>
          </h3>

          <div className="flex items-center gap-1">
            {history.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={onUndoLast}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                  title="직전 작업 실행 취소"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => exportPackingHistoryToExcel(history)}
                  className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  title="엑셀로 내보내기"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={onClearHistory}
                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="내역 전체 삭제"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Filter Input if history is > 3 */}
        {history.length > 3 && (
          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="내역 검색 (바이어, 품목, 바코드)"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        )}

        {/* History Scrollable List */}
        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 text-xs">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <p className="text-xs">
                {filterText ? '검색 결과가 없습니다.' : '아직 작업된 내역이 없습니다.'}
              </p>
              <p className="text-[11px] text-slate-300 mt-0.5">
                바코드를 스캔하고 확인 완료를 누르면 실시간 기록됩니다.
              </p>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectHistoryItem(item)}
                className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-200 transition cursor-pointer flex items-center justify-between group"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-slate-800">{item.buyer}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{item.timestamp}</span>
                  </div>
                  <p className="text-slate-600 truncate max-w-[190px] font-medium mt-0.5">
                    {item.name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">{item.barcode}</p>
                </div>
                <div className="shrink-0 flex items-center gap-1">
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[10px] bg-emerald-100/70 px-2 py-0.5 rounded-md border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    검수완료
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};
