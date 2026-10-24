import * as XLSX from 'xlsx';
import { GuideRule, ItemMaster, PackingHistoryItem } from '../types';

export interface ParseExcelResult {
  guides: GuideRule[];
  items?: ItemMaster[];
  errors: string[];
}

export function parseGuidesAndItemsFromExcel(dataBuffer: ArrayBuffer): ParseExcelResult {
  const result: ParseExcelResult = {
    guides: [],
    items: [],
    errors: [],
  };

  try {
    const workbook = XLSX.read(dataBuffer, { type: 'array' });
    const sheetNames = workbook.SheetNames;

    if (!sheetNames || sheetNames.length === 0) {
      result.errors.push('엑셀 파일에 시트가 존재하지 않습니다.');
      return result;
    }

    // Check if there is a dedicated "품목" (Items) sheet or if everything is in first sheet
    let guideSheet = workbook.Sheets[sheetNames[0]];
    let itemSheet: XLSX.WorkSheet | null = null;

    for (const name of sheetNames) {
      const lower = name.toLowerCase();
      if (lower.includes('가이드') || lower.includes('규격') || lower.includes('buyer') || lower.includes('고객사')) {
        guideSheet = workbook.Sheets[name];
      }
      if (lower.includes('품목') || lower.includes('item') || lower.includes('sku') || lower.includes('바코드')) {
        itemSheet = workbook.Sheets[name];
      }
    }

    // 1. Parse Guides
    const guideRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(guideSheet);
    if (guideRows && guideRows.length > 0) {
      const parsedGuides: GuideRule[] = [];

      guideRows.forEach((row, index) => {
        // Find buyer key
        const buyer = findValue(row, ['고객사 명', '고객사명', '고객사', '고객社', 'Buyer', 'buyer']);
        if (!buyer) return;

        const pos = findValue(row, ['부착위치', '부착 위치', '위치', 'Position', 'Location']) || '패키지 뒤';
        const handling = findValue(row, ['부착방식', '부착 방식', '바코드 처리', '처리방식', 'Handling']) || '바코드 가리지않음';
        const printMethod = findValue(row, ['스티커 출력 방식', '출력 방식', '출력방식', '라벨규격', '규격', 'Print Method']) || '조립처에 요청';
        const notes = findValue(row, ['특이사항', '비고', '주의점', 'Notes', 'Remarks']) || '';

        const side: '앞' | '뒤' = pos.includes('앞') || pos.toLowerCase().includes('front') ? '앞' : '뒤';
        const isJarir = buyer.toUpperCase().includes('JARIR');

        let stickerSize = '공통 스티커';
        if (printMethod.includes('65') || printMethod.includes('65 X 44')) stickerSize = '65 X 44';
        else if (printMethod.includes('45') || printMethod.includes('45 X 35')) stickerSize = '45 X 35';

        // Layout positioning based on side and handling
        let top = 24;
        let left = 18;
        let width = 64;
        let height = 20;

        if (side === '앞') {
          top = 42;
        } else if (handling.includes('가림') || handling.includes('덮어')) {
          top = 64; // overlaps existing barcode
        } else {
          top = 22; // safe upper/middle section
        }

        parsedGuides.push({
          id: `guide-${Date.now()}-${index}`,
          buyer,
          pos,
          side,
          handling,
          printMethod,
          stickerSize,
          hasRealPhoto: !isJarir,
          photoFileName: isJarir ? '' : `${buyer.toLowerCase().replace(/[^a-z0-9]/g, '_')}_sample.png`,
          notes,
          stickerTopPercent: top,
          stickerLeftPercent: left,
          stickerWidthPercent: width,
          stickerHeightPercent: height,
        });
      });

      result.guides = parsedGuides;
    }

    // 2. Parse Items if sheet exists
    if (itemSheet) {
      const itemRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(itemSheet);
      const parsedItems: ItemMaster[] = [];

      itemRows.forEach((row) => {
        const barcode = String(findValue(row, ['바코드', 'Barcode', '바코드번호']) || '').trim();
        const sku = String(findValue(row, ['SKU', '품번', '상품코드']) || barcode).trim();
        const name = String(findValue(row, ['품목명', '품목 명', '제품명', '상품명', 'Item Name', 'Name']) || '').trim();
        const buyer = String(findValue(row, ['고객사 명', '고객사', 'Buyer']) || '').trim();
        const category = String(findValue(row, ['카테고리', '분류', 'Category']) || '').trim();

        if (barcode && (name || sku)) {
          parsedItems.push({
            barcode,
            sku: sku || barcode,
            name: name || sku,
            buyer: buyer || (result.guides[0]?.buyer ?? '기본고객사'),
            category,
          });
        }
      });

      result.items = parsedItems;
    }
  } catch (err) {
    console.error('Excel parse error:', err);
    result.errors.push(err instanceof Error ? err.message : '엑셀 파일을 분석하는 도중 오류가 발생했습니다.');
  }

  return result;
}

function findValue(row: Record<string, unknown>, candidateKeys: string[]): string {
  for (const key of candidateKeys) {
    if (row[key] !== undefined && row[key] !== null) {
      return String(row[key]).trim();
    }
  }
  // Try case-insensitive lookup
  const rowKeys = Object.keys(row);
  for (const cKey of candidateKeys) {
    const matched = rowKeys.find((k) => k.trim().toLowerCase() === cKey.trim().toLowerCase());
    if (matched && row[matched] !== undefined && row[matched] !== null) {
      return String(row[matched]).trim();
    }
  }
  return '';
}

/**
 * Downloads a pre-formatted Excel template with Guides and Item Master sheets
 */
export function downloadExcelTemplate() {
  const wb = XLSX.utils.book_new();

  // 1. Guides Sheet
  const guideData = [
    {
      '고객사 명': 'D-R-O',
      '부착위치': '패키지 뒤',
      '부착방식': '바코드 가리지않음',
      '스티커 출력 방식': '조립처에 요청',
      '특이사항': '공통 스티커 부착\n※ 유니버셜 품목은 별도의 품목 스티커 출력 후 부착 필요',
    },
    {
      '고객사 명': 'ELEMENT',
      '부착위치': '패키지 뒤',
      '부착방식': '바코드 가리지않음',
      '스티커 출력 방식': '아이라벨 65 X 44\n(품목별 이미지파일 불러와 출력)',
      '특이사항': '품목 별 스티커 출력 후 부착\n※ 신규 품목 입고 시 고객사에 이미지 파일 사전 요청 필수',
    },
    {
      '고객사 명': 'ROA',
      '부착위치': '패키지 뒤',
      '부착방식': '바코드 가림 (덮어 부착)',
      '스티커 출력 방식': '아이라벨 45 X 35\n(품목별 데이터파일 불러와 출력)',
      '특이사항': '품목 별 스티커 출력 후 부착 (기존 바코드 완벽 가림)\n※ 신규 품목 입고 시 고객사에 바코드 데이터 사전 요청 필수',
    },
    {
      '고객사 명': 'JARIR',
      '부착위치': '패키지 뒤',
      '부착방식': '바코드 가리지않음',
      '스티커 출력 방식': '조립처에 요청',
      '특이사항': '공통 스티커 부착 (※ 실리콘밴드, 캐링케이스 등 특정 품목은 별도의 스티커 추가 부착 必)\n※ 실물 스티커 사진 촬영 후 추후 시스템 등록 예정',
    },
    {
      '고객사 명': 'TAICHEONG',
      '부착위치': '패키지 앞',
      '부착방식': '해당 없음 (-)',
      '스티커 출력 방식': '조립처에 요청',
      '특이사항': '공통스티커 부착 (패키지 전면 지정 위치 부착)',
    },
  ];

  const guideWS = XLSX.utils.json_to_sheet(guideData);
  guideWS['!cols'] = [{ wch: 15 }, { wch: 12 }, { wch: 22 }, { wch: 35 }, { wch: 45 }];
  XLSX.utils.book_append_sheet(wb, guideWS, '라벨부착가이드');

  // 2. Items Sheet
  const itemData = [
    {
      '바코드': '8801234567890',
      'SKU': 'CAS-IP16-CLR',
      '품목명': '아이폰 16 투명 크리스탈 케이스',
      '고객사 명': 'D-R-O',
      '카테고리': '스마트폰 케이스',
    },
    {
      '바코드': '8801234567891',
      'SKU': 'CAS-ZF7-SLM',
      '품목명': '갤럭시 Z폴드7 슬림 핏 케이스',
      '고객사 명': 'ROA',
      '카테고리': '스마트폰 케이스',
    },
    {
      '바코드': '8801234567892',
      'SKU': 'ELM-GLS-9H',
      '품목명': '강화유리 액정보호필름 2P 패키지',
      '고객사 명': 'ELEMENT',
      '카테고리': '보호필름',
    },
    {
      '바코드': '8801234567893',
      'SKU': 'JAR-BND-SIL',
      '품목명': '실리콘 밴드 스트랩 (사파이어 블루)',
      '고객사 명': 'JARIR',
      '카테고리': '웨어러블 액세서리',
    },
    {
      '바코드': '8801234567894',
      'SKU': 'TCH-CHR-30W',
      '품목명': '초고속 듀얼 충전기 30W USB-C',
      '고객사 명': 'TAICHEONG',
      '카테고리': '충전기/케이블',
    },
  ];

  const itemWS = XLSX.utils.json_to_sheet(itemData);
  itemWS['!cols'] = [{ wch: 18 }, { wch: 16 }, { wch: 35 }, { wch: 15 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, itemWS, '품목마스터');

  XLSX.writeFile(wb, '해외물류_라벨가이드_표준양식.xlsx');
}

/**
 * Exports packing history to Excel
 */
export function exportPackingHistoryToExcel(history: PackingHistoryItem[]) {
  if (history.length === 0) {
    alert('내보낼 패킹 작업 내역이 없습니다.');
    return;
  }

  const exportData = history.map((item, index) => ({
    '순번': index + 1,
    '완료 시간': item.timestamp,
    '고객사': item.buyer,
    '품목명': item.name,
    '바코드': item.barcode,
    'SKU': item.sku,
    '상태': item.status === 'completed' ? '검수 완료' : '특이사항 보류',
    '비고': item.notes || '',
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exportData);
  ws['!cols'] = [{ wch: 8 }, { wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 18 }, { wch: 16 }, { wch: 12 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(wb, ws, '일일패킹작업기록');

  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  XLSX.writeFile(wb, `해외물류_패킹검수내역_${dateStr}.xlsx`);
}
