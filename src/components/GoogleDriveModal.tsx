import React, { useState, useEffect, useCallback } from 'react';
import { GuideRule } from '../types';
import {
  listDriveFiles,
  downloadDriveFileAsArrayBuffer,
  downloadDriveFileAsDataUrl,
  uploadJsonToDrive,
  deleteDriveFile,
  DriveFileItem,
} from '../services/googleDrive';
import { parseGuidesAndItemsFromExcel } from '../utils/excel';
import {
  HardDrive,
  X,
  Search,
  RefreshCw,
  FileSpreadsheet,
  FileImage,
  FileText,
  CloudUpload,
  ExternalLink,
  Trash2,
  Check,
  AlertTriangle,
  Loader2,
  FileCode,
} from 'lucide-react';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  guides: GuideRule[];
  activeBuyer: string;
  onApplyGuides: (newGuides: GuideRule[]) => void;
  onApplyStickerPhoto: (buyer: string, photoUrl: string, fileName: string) => void;
  onApplyAttachedPhoto: (buyer: string, photoUrl: string, fileName: string) => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  guides,
  activeBuyer,
  onApplyGuides,
  onApplyStickerPhoto,
  onApplyAttachedPhoto,
}) => {
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'spreadsheets' | 'images'>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Destructive Action Confirmation State
  const [deleteTargetFile, setDeleteTargetFile] = useState<DriveFileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Import Confirmation State
  const [importTargetFile, setImportTargetFile] = useState<DriveFileItem | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const items = await listDriveFiles({
        keyword: searchQuery,
        filter: filterType,
        pageSize: 40,
      });
      setFiles(items);
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : 'Google Drive 파일을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filterType]);

  useEffect(() => {
    if (isOpen) {
      fetchFiles();
      setActionSuccessMsg(null);
      setErrorMsg(null);
    }
  }, [isOpen, fetchFiles]);

  // Flash success message
  const triggerSuccess = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  // Backup current guides to Google Drive as JSON
  const handleBackupToDrive = async () => {
    try {
      setIsUploading(true);
      const now = new Date();
      const timestamp = now.toISOString().slice(0, 10).replace(/-/g, '');
      const fileName = `해외B2B_스티커부착가이드_백업_${timestamp}.json`;

      await uploadJsonToDrive(fileName, {
        exportDate: now.toISOString(),
        version: '2.0',
        totalGuides: guides.length,
        guides: guides,
      });

      triggerSuccess(`'${fileName}' 파일이 Google Drive에 성공적으로 백업 저장되었습니다!`);
      fetchFiles();
    } catch (err: unknown) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Google Drive 백업에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  // Confirm and Execute Import
  const handleConfirmImport = async () => {
    if (!importTargetFile) return;
    try {
      setIsImporting(true);
      const buffer = await downloadDriveFileAsArrayBuffer(
        importTargetFile.id,
        importTargetFile.mimeType
      );

      // Check if it's a JSON file
      if (
        importTargetFile.name.endsWith('.json') ||
        importTargetFile.mimeType === 'application/json'
      ) {
        const textDecoder = new TextDecoder('utf-8');
        const jsonText = textDecoder.decode(buffer);
        const parsed = JSON.parse(jsonText);
        const importedGuides = Array.isArray(parsed) ? parsed : parsed.guides;

        if (Array.isArray(importedGuides) && importedGuides.length > 0) {
          onApplyGuides(importedGuides);
          triggerSuccess(
            `'${importTargetFile.name}'에서 총 ${importedGuides.length}개 가이드를 불러왔습니다!`
          );
          setImportTargetFile(null);
          return;
        } else {
          throw new Error('유효한 가이드 데이터 목록을 찾을 수 없습니다.');
        }
      }

      // Otherwise parse as Excel Spreadsheet
      const result = parseGuidesAndItemsFromExcel(buffer);
      if (result.guides.length > 0) {
        onApplyGuides(result.guides);
        triggerSuccess(
          `'${importTargetFile.name}'에서 총 ${result.guides.length}개 고객사 가이드를 가져왔습니다!`
        );
        setImportTargetFile(null);
      } else {
        throw new Error(
          result.errors.join('\n') || '엑셀 파일에서 가이드 데이터를 인식할 수 없습니다.'
        );
      }
    } catch (err: unknown) {
      console.error(err);
      alert(err instanceof Error ? err.message : '가이드 불러오기에 실패했습니다.');
    } finally {
      setIsImporting(false);
    }
  };

  // Apply Image from Drive to Active Buyer
  const handleApplyImage = async (
    file: DriveFileItem,
    target: 'sticker' | 'attached'
  ) => {
    try {
      setLoading(true);
      const dataUrl = await downloadDriveFileAsDataUrl(file.id);

      if (target === 'sticker') {
        onApplyStickerPhoto(activeBuyer, dataUrl, file.name);
        triggerSuccess(`[${activeBuyer}] 스티커 사진으로 Drive 이미지('${file.name}')가 적용되었습니다.`);
      } else {
        onApplyAttachedPhoto(activeBuyer, dataUrl, file.name);
        triggerSuccess(`[${activeBuyer}] 실부착 사진으로 Drive 이미지('${file.name}')가 적용되었습니다.`);
      }
    } catch (err: unknown) {
      console.error(err);
      alert(err instanceof Error ? err.message : '이미지 적용 실패');
    } finally {
      setLoading(false);
    }
  };

  // Execute Destructive Delete Operation (strictly confirmed via dialog)
  const handleExecuteDelete = async () => {
    if (!deleteTargetFile) return;
    try {
      setIsDeleting(true);
      await deleteDriveFile(deleteTargetFile.id);
      triggerSuccess(`'${deleteTargetFile.name}' 파일이 Google Drive에서 삭제되었습니다.`);
      setDeleteTargetFile(null);
      fetchFiles();
    } catch (err: unknown) {
      console.error(err);
      alert(err instanceof Error ? err.message : '파일 삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-md shadow-blue-500/20">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight">Google Drive 파일 연동 & 동기화</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Drive v3
                </span>
              </div>
              <p className="text-xs text-slate-400">
                내 Google Drive의 엑셀/시트 가이드 불러오기, 백업 저장 및 라벨/실물 사진 선택
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Control Bar (Search, Filter, Backup Button) */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchFiles()}
              placeholder="Google Drive 파일 검색..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg transition ${
                filterType === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              전체
            </button>
            <button
              type="button"
              onClick={() => setFilterType('spreadsheets')}
              className={`px-3 py-1 rounded-lg flex items-center gap-1 transition ${
                filterType === 'spreadsheets'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>엑셀/시트/JSON</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterType('images')}
              className={`px-3 py-1 rounded-lg flex items-center gap-1 transition ${
                filterType === 'images'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileImage className="w-3.5 h-3.5 text-blue-600" />
              <span>이미지/사진</span>
            </button>
          </div>

          {/* Action Buttons: Refresh & Backup */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchFiles}
              disabled={loading}
              className="p-2 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl text-slate-600 transition cursor-pointer"
              title="새로고침"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleBackupToDrive}
              disabled={isUploading}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-60"
              title="현재 가이드 데이터를 Google Drive에 백업 저장"
            >
              {isUploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CloudUpload className="w-3.5 h-3.5" />
              )}
              <span>Drive에 가이드 백업 저장</span>
            </button>
          </div>
        </div>

        {/* Notifications Bar */}
        {actionSuccessMsg && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="bg-rose-50 border-b border-rose-200 px-6 py-2.5 text-rose-800 text-xs font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Active Customer Indicator for Image selection */}
        <div className="px-6 py-2 bg-blue-50/70 border-b border-blue-100 text-xs text-blue-900 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold">현재 선택된 고객사:</span>
            <span className="font-black bg-blue-600 text-white px-2 py-0.5 rounded-md">
              {activeBuyer}
            </span>
            <span className="text-slate-500 text-[11px]">
              (Drive 이미지를 바로 이 고객사의 스티커 또는 실부착 사진으로 등록할 수 있습니다)
            </span>
          </div>
        </div>

        {/* File List Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2.5 bg-slate-100/50">
          {loading && files.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-xs font-medium">Google Drive 파일 목록을 불러오는 중...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2 bg-white rounded-2xl border border-slate-200">
              <HardDrive className="w-10 h-10 text-slate-300" />
              <p className="text-sm font-bold text-slate-600">조건에 맞는 파일이 없습니다.</p>
              <p className="text-xs text-slate-400">
                우측 상단의 [Drive에 가이드 백업 저장] 버튼을 눌러 첫 백업을 저장해보세요.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {files.map((file) => {
                const isImage =
                  file.mimeType.startsWith('image/') ||
                  /\.(png|jpg|jpeg|webp)$/i.test(file.name);
                const isSheet =
                  file.mimeType.includes('spreadsheet') ||
                  file.mimeType.includes('excel') ||
                  /\.(xlsx|xls)$/i.test(file.name);
                const isJson =
                  file.mimeType === 'application/json' || file.name.endsWith('.json');

                return (
                  <div
                    key={file.id}
                    className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-3">
                      {/* Thumbnail or File Type Icon */}
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                        {file.thumbnailLink ? (
                          <img
                            src={file.thumbnailLink}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // fallback to icon if thumbnail fails
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : isImage ? (
                          <FileImage className="w-6 h-6 text-blue-500" />
                        ) : isSheet ? (
                          <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
                        ) : isJson ? (
                          <FileCode className="w-6 h-6 text-amber-500" />
                        ) : (
                          <FileText className="w-6 h-6 text-slate-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4
                          className="text-xs font-black text-slate-800 truncate group-hover:text-blue-600"
                          title={file.name}
                        >
                          {file.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                          <span>
                            {isSheet
                              ? '엑셀/시트'
                              : isImage
                              ? '이미지'
                              : isJson
                              ? 'JSON 백업'
                              : '문서'}
                          </span>
                          {file.modifiedTime && (
                            <>
                              <span>•</span>
                              <span>{new Date(file.modifiedTime).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Open in Google Drive Link */}
                      {file.webViewLink && (
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition"
                          title="Google Drive 웹에서 열기"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    {/* Action Buttons for this file */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* If it's a Spreadsheet or JSON: Offer Import */}
                        {(isSheet || isJson) && (
                          <button
                            type="button"
                            onClick={() => setImportTargetFile(file)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-[11px] font-bold transition cursor-pointer"
                            title="이 파일의 가이드 데이터를 앱으로 가져오기"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                            <span>가이드로 불러오기</span>
                          </button>
                        )}

                        {/* If it's an Image: Offer Photo assignment to active customer */}
                        {isImage && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApplyImage(file, 'sticker')}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-[11px] font-bold transition cursor-pointer"
                              title={`[${activeBuyer}] 스티커 라벨 사진으로 지정`}
                            >
                              <span>스티커 사진으로 지정</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleApplyImage(file, 'attached')}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-[11px] font-bold transition cursor-pointer"
                              title={`[${activeBuyer}] 실부착 사진으로 지정`}
                            >
                              <span>실부착 사진으로 지정</span>
                            </button>
                          </>
                        )}
                      </div>

                      {/* Delete File button (triggers explicit confirmation modal) */}
                      <button
                        type="button"
                        onClick={() => setDeleteTargetFile(file)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                        title="Google Drive에서 파일 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>총 {files.length}개 파일 표시됨</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>

      {/* ========================================================
          CONFIRMATION MODAL 1: IMPORT CONFIRMATION
          ======================================================== */}
      {importTargetFile && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-black text-slate-900">가이드 데이터 가져오기 확인</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Google Drive 파일 <strong className="text-slate-900">'{importTargetFile.name}'</strong>의 가이드 데이터로 현재 작업 중인 가이드 목록을 덮어씌우시겠습니까?
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setImportTargetFile(null)}
                disabled={isImporting}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={isImporting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-sm transition cursor-pointer"
              >
                {isImporting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>가져오기 실행</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          CONFIRMATION MODAL 2: DESTRUCTIVE DELETE CONFIRMATION (MANDATORY)
          ======================================================== */}
      {deleteTargetFile && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-rose-200 space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-black text-slate-900">Google Drive 파일 삭제 확인</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                정말로 Google Drive에서 <strong className="text-slate-900">'{deleteTargetFile.name}'</strong> 파일을 영구 삭제하시겠습니까?
                <br />
                <span className="text-rose-600 font-bold">이 작업은 취소할 수 없습니다.</span>
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetFile(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                취소 (유지)
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-sm transition cursor-pointer"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>확인하고 삭제하기</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
