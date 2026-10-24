import React, { useState, useRef, useEffect } from 'react';
import { ScanBarcode, Search, ChevronDown, Camera, X } from 'lucide-react';
import { GuideRule, ItemMaster } from '../types';

interface ScannerBarProps {
  guideRules: GuideRule[];
  itemMaster: ItemMaster[];
  onSearch: (query: string, selectedBuyer: string) => void;
  onOpenItemModal: () => void;
  selectedBuyer: string;
  setSelectedBuyer: (buyer: string) => void;
  onQuickTestItem: (item: ItemMaster) => void;
  onToggleCameraModal: () => void;
}

export const ScannerBar: React.FC<ScannerBarProps> = ({
  guideRules,
  itemMaster,
  onSearch,
  onOpenItemModal,
  selectedBuyer,
  setSelectedBuyer,
  onQuickTestItem,
  onToggleCameraModal,
}) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on load and after scanning
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSearch(inputValue.trim(), selectedBuyer);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleClear = () => {
    setInputValue('');
    inputRef.current?.focus();
  };

  const uniqueBuyers = Array.from(new Set(guideRules.map((g) => g.buyer)));

  return (
    <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Buyer Selector */}
        <div className="md:col-span-4">
          <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center justify-between">
            <span>고객사 직접 선택</span>
            <span className="text-[11px] text-slate-400 font-normal">바코드 자동 매핑 가능</span>
          </label>
          <div className="relative">
            <select
              value={selectedBuyer}
              onChange={(e) => {
                const b = e.target.value;
                setSelectedBuyer(b);
                if (b) {
                  onSearch(inputValue.trim(), b);
                }
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none cursor-pointer"
            >
              <option value="">고객사 전체 (바코드 매핑)</option>
              {uniqueBuyers.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Barcode Input Box with Handheld scanner optimization */}
        <div className="md:col-span-8">
          <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center justify-between">
            <span>제품 바코드 또는 SKU 스캔 (Enter)</span>
            <button
              type="button"
              onClick={onOpenItemModal}
              className="text-[11px] text-blue-600 hover:text-blue-800 font-medium underline"
            >
              등록 품목 목록 보기 ({itemMaster.length}건)
            </button>
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <ScanBarcode className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="핸디스캐너 스캔 또는 바코드/SKU 직접 입력"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-11 pr-10 py-2.5 text-base font-bold tracking-wider text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:font-normal placeholder:text-sm"
              />
              {inputValue && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Camera Scan Button */}
            <button
              type="button"
              onClick={onToggleCameraModal}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition border border-slate-300"
              title="카메라 바코드 스캐너 열기"
            >
              <Camera className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">카메라</span>
            </button>

            {/* Search Button */}
            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5 transition shadow-sm active:scale-95"
            >
              <Search className="w-4 h-4" />
              <span>조회</span>
            </button>
          </div>
        </div>
      </form>

      {/* Quick Test Sample Barcode Pills for Operators */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
          빠른 테스트:
        </span>
        {itemMaster.slice(0, 5).map((item) => (
          <button
            key={item.barcode}
            type="button"
            onClick={() => {
              setInputValue(item.barcode);
              onQuickTestItem(item);
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 text-slate-700 transition"
          >
            <span className="font-bold text-blue-600">[{item.buyer}]</span>
            <span className="truncate max-w-[130px]">{item.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
};
