import React, { useState } from 'react';
import { GuideRule } from '../types';
import { X, Plus, Trash2, Edit3, Check, BookOpen } from 'lucide-react';

interface GuidelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  guides: GuideRule[];
  onSaveGuides: (guides: GuideRule[]) => void;
  onSelectBuyer: (buyer: string) => void;
}

export const GuidelineModal: React.FC<GuidelineModalProps> = ({
  isOpen,
  onClose,
  guides,
  onSaveGuides,
  onSelectBuyer,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<GuideRule>>({});
  const [isAddingNew, setIsAddingNew] = useState(false);

  if (!isOpen) return null;

  const handleStartEdit = (guide: GuideRule) => {
    setEditingId(guide.id);
    setFormData({ ...guide });
    setIsAddingNew(false);
  };

  const handleStartAdd = () => {
    setIsAddingNew(true);
    setEditingId('new');
    setFormData({
      id: `guide-${Date.now()}`,
      buyer: '',
      pos: '패키지 뒤',
      side: '뒤',
      handling: '바코드 가리지않음',
      printMethod: '조립처에 요청',
      stickerSize: '공통 스티커',
      hasRealPhoto: false,
      notes: '',
      stickerTopPercent: 24,
      stickerLeftPercent: 18,
      stickerWidthPercent: 64,
      stickerHeightPercent: 20,
    });
  };

  const handleSave = () => {
    if (!formData.buyer?.trim()) {
      alert('고객사 명을 입력해 주세요.');
      return;
    }

    const side = formData.pos?.includes('앞') ? '앞' : '뒤';
    const updatedRule: GuideRule = {
      id: formData.id || `guide-${Date.now()}`,
      buyer: formData.buyer.trim(),
      pos: formData.pos || '패키지 뒤',
      side,
      handling: formData.handling || '바코드 가리지않음',
      printMethod: formData.printMethod || '조립처에 요청',
      stickerSize: formData.stickerSize || '공통 스티커',
      hasRealPhoto: formData.hasRealPhoto ?? false,
      notes: formData.notes || '',
      stickerTopPercent: formData.stickerTopPercent ?? (side === '앞' ? 40 : 24),
      stickerLeftPercent: 18,
      stickerWidthPercent: 64,
      stickerHeightPercent: 20,
    };

    if (isAddingNew) {
      onSaveGuides([...guides, updatedRule]);
    } else {
      onSaveGuides(guides.map((g) => (g.id === editingId ? updatedRule : g)));
    }

    setEditingId(null);
    setIsAddingNew(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('이 고객사 가이드 규칙을 삭제하시겠습니까?')) {
      onSaveGuides(guides.filter((g) => g.id !== id));
      if (editingId === id) setEditingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-base font-bold">고객사별 라벨 부착 가이드 관리</h2>
              <p className="text-xs text-slate-400">등록된 고객사 규격 직접 조회 및 수정</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500">
              총 {guides.length}개 고객사 가이드 등록됨
            </span>
            <button
              onClick={handleStartAdd}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>신규 가이드 추가</span>
            </button>
          </div>

          {/* Form when Editing or Adding */}
          {editingId && (
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3">
              <h4 className="text-xs font-black text-blue-900 uppercase">
                {isAddingNew ? '신규 가이드 등록' : '가이드 정보 수정'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">고객사 명 *</label>
                  <input
                    type="text"
                    value={formData.buyer || ''}
                    onChange={(e) => setFormData({ ...formData, buyer: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                    placeholder="예: ELEMENT"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">부착 위치 *</label>
                  <select
                    value={formData.pos || '패키지 뒤'}
                    onChange={(e) => setFormData({ ...formData, pos: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                  >
                    <option value="패키지 뒤">패키지 뒤 (뒷면)</option>
                    <option value="패키지 앞">패키지 앞 (전면)</option>
                    <option value="패키지 측면">패키지 측면</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">부착 방식 *</label>
                  <select
                    value={formData.handling || '바코드 가리지않음'}
                    onChange={(e) => setFormData({ ...formData, handling: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                  >
                    <option value="바코드 가리지않음">바코드 가리지않음 (여백 부착)</option>
                    <option value="바코드 가림 (덮어 부착)">바코드 가림 (덮어 부착)</option>
                    <option value="해당 없음 (-)">해당 없음 (-)</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">스티커 출력 방식</label>
                  <input
                    type="text"
                    value={formData.printMethod || ''}
                    onChange={(e) => setFormData({ ...formData, printMethod: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                    placeholder="예: 아이라벨 65 X 44 (품목별 이미지파일 불러와 출력)"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">스티커 규격 라벨</label>
                  <input
                    type="text"
                    value={formData.stickerSize || ''}
                    onChange={(e) => setFormData({ ...formData, stickerSize: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                    placeholder="예: 65 X 44 또는 공통 스티커"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">특이사항 및 작업 주의점</label>
                  <textarea
                    rows={2}
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                    placeholder="예: 품목 별 스티커 출력 후 부착 (기존 바코드 완벽 가림)"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-lg text-xs font-semibold"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>저장</span>
                </button>
              </div>
            </div>
          )}

          {/* Guidelines Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">고객사</th>
                  <th className="py-2.5 px-3">부착 위치</th>
                  <th className="py-2.5 px-3">부착 방식</th>
                  <th className="py-2.5 px-3">출력 규격</th>
                  <th className="py-2.5 px-3">특이사항</th>
                  <th className="py-2.5 px-3 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {guides.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectBuyer(g.buyer);
                          onClose();
                        }}
                        className="text-blue-600 hover:underline text-left font-bold"
                      >
                        {g.buyer}
                      </button>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          g.side === '앞'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {g.pos}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[11px] font-bold ${
                          g.handling.includes('가림') ? 'text-rose-600' : 'text-slate-700'
                        }`}
                      >
                        {g.handling}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 whitespace-pre-line text-[11px]">
                      {g.printMethod}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 max-w-[220px] truncate text-[11px]">
                      {g.notes}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex justify-end items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(g)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded transition"
                          title="수정"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(g.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                          title="삭제"
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
