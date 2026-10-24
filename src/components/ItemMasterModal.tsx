import React, { useState } from 'react';
import { ItemMaster, GuideRule } from '../types';
import { X, Search, Plus, Trash2, Barcode, Play, Package } from 'lucide-react';

interface ItemMasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ItemMaster[];
  guides: GuideRule[];
  onSaveItems: (items: ItemMaster[]) => void;
  onSelectItemToPack: (item: ItemMaster) => void;
}

export const ItemMasterModal: React.FC<ItemMasterModalProps> = ({
  isOpen,
  onClose,
  items,
  guides,
  onSaveItems,
  onSelectItemToPack,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState<ItemMaster>({
    barcode: '',
    sku: '',
    name: '',
    buyer: guides[0]?.buyer || 'D-R-O',
    category: '기타 액세서리',
  });

  if (!isOpen) return null;

  const filteredItems = items.filter(
    (item) =>
      item.barcode.includes(searchTerm) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.buyer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.barcode.trim() || !newItem.name.trim()) {
      alert('바코드와 품목명을 모두 입력해 주세요.');
      return;
    }

    if (items.some((i) => i.barcode === newItem.barcode.trim())) {
      alert('이미 동일한 바코드가 등록되어 있습니다.');
      return;
    }

    const created: ItemMaster = {
      barcode: newItem.barcode.trim(),
      sku: newItem.sku.trim() || newItem.barcode.trim(),
      name: newItem.name.trim(),
      buyer: newItem.buyer,
      category: newItem.category?.trim() || '기타',
    };

    onSaveItems([created, ...items]);
    setIsAdding(false);
    setNewItem({
      barcode: '',
      sku: '',
      name: '',
      buyer: guides[0]?.buyer || 'D-R-O',
      category: '기타 액세서리',
    });
  };

  const handleDeleteItem = (barcode: string) => {
    if (confirm(`바코드 [${barcode}] 품목을 삭제하시겠습니까?`)) {
      onSaveItems(items.filter((i) => i.barcode !== barcode));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <Package className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-base font-bold">출고 품목 마스터 (SKU / Barcode)</h2>
              <p className="text-xs text-slate-400">등록된 제품 바코드 및 고객사 매핑 목록</p>
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
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            {/* Search Box */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="품목명, 바코드, SKU, 고객사 검색"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={() => setIsAdding(!isAdding)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-xs w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4" />
              <span>{isAdding ? '등록 닫기' : '품목 직접 추가'}</span>
            </button>
          </div>

          {/* New Item Form */}
          {isAdding && (
            <form
              onSubmit={handleAddNewItem}
              className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3"
            >
              <h4 className="text-xs font-black text-slate-800 uppercase">신규 품목 등록</h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">바코드 *</label>
                  <input
                    type="text"
                    required
                    value={newItem.barcode}
                    onChange={(e) => setNewItem({ ...newItem, barcode: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold"
                    placeholder="8801234567890"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">SKU / 품번</label>
                  <input
                    type="text"
                    value={newItem.sku}
                    onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                    placeholder="CAS-IP16-CLR"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">품목명 *</label>
                  <input
                    type="text"
                    required
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                    placeholder="제품명 입력"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">고객사 (Buyer)</label>
                  <select
                    value={newItem.buyer}
                    onChange={(e) => setNewItem({ ...newItem, buyer: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                  >
                    {guides.map((g) => (
                      <option key={g.buyer} value={g.buyer}>
                        {g.buyer}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">카테고리</label>
                  <input
                    type="text"
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                    placeholder="케이스 / 필름 등"
                  />
                </div>
                <div className="sm:col-span-2 flex items-end justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-3 py-1.5 bg-slate-200 rounded-lg text-xs font-semibold"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold"
                  >
                    품목 저장
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">바코드</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">품목명</th>
                  <th className="py-2.5 px-3">매핑 고객사</th>
                  <th className="py-2.5 px-3 text-right">검수 테스트 / 삭제</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredItems.map((item) => (
                  <tr key={item.barcode} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900 flex items-center gap-1.5">
                      <Barcode className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.barcode}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{item.sku}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{item.name}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-50 text-blue-800 border border-blue-200">
                        {item.buyer}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex justify-end items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectItemToPack(item);
                            onClose();
                          }}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                        >
                          <Play className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                          <span>가이드 호출</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.barcode)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                          title="품목 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
