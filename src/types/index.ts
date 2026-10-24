export interface GuideRule {
  id: string;
  buyer: string;
  pos: string; // '패키지 뒤', '패키지 앞', etc.
  side: '앞' | '뒤';
  handling: string; // '바코드 가리지않음', '바코드 가림 (덮어 부착)', '해당 없음 (-)'
  printMethod: string; // e.g. '조립처에 요청', '아이라벨 65 X 44\n(품목별 이미지파일 불러와 출력)'
  stickerSize: string; // e.g. '공통 스티커', '65 X 44', '45 X 35'
  hasRealPhoto: boolean;
  photoUrl?: string;
  photoFileName?: string;
  stickerPhotoUrl?: string;
  stickerPhotoFileName?: string;
  notes: string;
  // Box visual coordinates in percentage
  stickerTopPercent: number;
  stickerLeftPercent: number;
  stickerWidthPercent: number;
  stickerHeightPercent: number;
}

export interface ItemMaster {
  barcode: string;
  sku: string;
  name: string;
  buyer: string;
  category?: string;
}

export interface PackingHistoryItem {
  id: string;
  timestamp: string;
  buyer: string;
  name: string;
  barcode: string;
  sku: string;
  status: 'completed' | 'flagged';
  notes?: string;
}

export interface ActiveGuideState {
  buyer: string;
  name: string;
  barcode: string;
  sku: string;
  rule: GuideRule;
  isCustomItem?: boolean;
}
