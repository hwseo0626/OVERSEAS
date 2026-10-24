import React, { useState } from 'react';
import { GuideRule } from '../types';
import {
  FileSpreadsheet,
  Search,
  ArrowUpRight,
  Download,
  AlertTriangle,
  CheckCircle2,
  Camera,
  Layers,
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface ExcelTableViewProps {
  guides: GuideRule[];
  onSelectBuyer: (buyer: string) => void;
}

export const ExcelTableView: React.FC<ExcelTableViewProps> = ({
  guides,
  onSelectBuyer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = guides.filter(
    (g) =>
      g.buyer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.pos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.handling.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.printMethod.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.notes.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportExcel = () => {
    const data = guides.map((g, idx) => ({
      '순번': idx + 1,
      '고객사 명': g.buyer,
      '부착위치': g.pos,
      '부착방식': g.handling,
      '스티커 출력 방식': g.printMethod,
      '라벨 규격': g.stickerSize,
      '특이사항': g.notes,
      '실물 사진': g.hasRealPhoto ? '등록 완료' : '촬영 대기',
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [
      { wch: 6 },
      { wch: 15 },
      { wch: 12 },
      { wch: 22 },
      { wch: 35 },
      { wch: 15 },
      { wch: 45 },
      { wch: 12 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, '라벨부착가이드');
    XLSX.writeFile(wb, '해외물류_라벨부착_가이드_규격표.xlsx');
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header bar */}
      <div className="p-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50">
        <div>
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <span>고객사별 라벨 부착 규격 전체 엑셀표</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            행을 클릭하면 해당 고객사의 시각적 튜토리얼 화면으로 이동합니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="고객사, 규격, 특이사항 검색"
              className="bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>엑셀 다운로드</span>
          </button>
        </div>
      </div>

      {/* Styled Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3.5 px-2.5 text-center w-12">No</th>
              <th className="py-3.5 px-3 text-center w-28">고객사 명</th>
              <th className="py-3.5 px-3 text-center w-28">부착 위치</th>
              <th className="py-3.5 px-3 text-center w-36">부착 방식 (바코드 처리)</th>
              <th className="py-3.5 px-3 text-center w-48">스티커 출력 방식</th>
              <th className="py-3.5 px-2.5 text-center w-24">규격</th>
              <th className="py-3.5 px-4 text-center min-w-[280px]">특이사항 및 작업 주의점</th>
              <th className="py-3.5 px-2.5 text-center w-24">실물 사진</th>
              <th className="py-3.5 px-3 text-center w-28">가이드 보기</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filtered.map((g, idx) => {
              const isCovering = g.handling.includes('가림') || g.handling.includes('덮어');
              const isFront = g.side === '앞';

              return (
                <tr
                  key={g.id || g.buyer}
                  onClick={() => onSelectBuyer(g.buyer)}
                  className="hover:bg-blue-50/60 cursor-pointer transition group"
                >
                  <td className="py-3.5 px-2.5 text-center font-mono text-slate-400">
                    {idx + 1}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span className="font-black text-sm text-slate-900 group-hover:text-blue-600 transition block">
                      {g.buyer}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={`inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                        isFront
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                      }`}
                    >
                      <Layers className="w-3 h-3" />
                      {g.pos}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={`inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold ${
                        isCovering
                          ? 'bg-rose-50 text-rose-700 border border-rose-300'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {isCovering ? (
                        <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      )}
                      <span>{g.handling}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span className="font-bold text-slate-900 whitespace-pre-line leading-relaxed text-xs block">
                      {g.printMethod}
                    </span>
                  </td>
                  <td className="py-3.5 px-2.5 text-center">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                      {g.stickerSize}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-left">
                    <p className="text-slate-700 text-xs font-semibold whitespace-pre-line leading-relaxed">
                      {g.notes || '-'}
                    </p>
                  </td>
                  <td className="py-3.5 px-2.5 text-center">
                    {g.hasRealPhoto ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        완료
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <Camera className="w-3 h-3" />
                        촬영대기
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectBuyer(g.buyer);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black transition shadow-xs hover:shadow-md cursor-pointer group-hover:scale-105"
                    >
                      <span>가이드 보기</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
