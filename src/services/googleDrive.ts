import { getAccessToken } from './googleAuth';

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  iconLink?: string;
  webViewLink?: string;
  size?: string;
  modifiedTime?: string;
}

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3';

/**
 * List files in user's Google Drive with optional keyword and mime-type filtering.
 */
export async function listDriveFiles(options?: {
  keyword?: string;
  filter?: 'all' | 'spreadsheets' | 'images';
  pageSize?: number;
}): Promise<DriveFileItem[]> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google 로그인이 필요합니다.');
  }

  const queries: string[] = ['trashed = false'];

  if (options?.keyword && options.keyword.trim()) {
    const safeWord = options.keyword.trim().replace(/['\\]/g, '');
    queries.push(`name contains '${safeWord}'`);
  }

  if (options?.filter === 'spreadsheets') {
    queries.push(
      "(mimeType = 'application/vnd.google-apps.spreadsheet' or mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' or mimeType = 'application/vnd.ms-excel' or name contains '.xlsx' or name contains '.xls' or name contains '.json')"
    );
  } else if (options?.filter === 'images') {
    queries.push(
      "(mimeType contains 'image/' or name contains '.png' or name contains '.jpg' or name contains '.jpeg' or name contains '.webp')"
    );
  }

  const q = encodeURIComponent(queries.join(' and '));
  const fields = encodeURIComponent('files(id, name, mimeType, thumbnailLink, iconLink, webViewLink, size, modifiedTime)');
  const pageSize = options?.pageSize || 30;

  const response = await fetch(
    `${DRIVE_API_BASE}/files?q=${q}&pageSize=${pageSize}&orderBy=modifiedTime desc&fields=${fields}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Drive 파일 조회 실패 (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.files || [];
}

/**
 * Download a file from Google Drive as ArrayBuffer.
 * Handles Google Spreadsheets automatically by exporting to .xlsx.
 */
export async function downloadDriveFileAsArrayBuffer(fileId: string, mimeType?: string): Promise<ArrayBuffer> {
  const token = await getAccessToken();
  if (!token) throw new Error('Google 로그인이 필요합니다.');

  let url = `${DRIVE_API_BASE}/files/${fileId}?alt=media`;

  // If it's a native Google Spreadsheet, export to Excel xlsx
  if (mimeType === 'application/vnd.google-apps.spreadsheet') {
    url = `${DRIVE_API_BASE}/files/${fileId}/export?mimeType=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`;
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`파일 다운로드 실패 (${response.status}): ${error}`);
  }

  return await response.arrayBuffer();
}

/**
 * Download an image file from Google Drive and convert to base64 Data URL.
 */
export async function downloadDriveFileAsDataUrl(fileId: string): Promise<string> {
  const token = await getAccessToken();
  if (!token) throw new Error('Google 로그인이 필요합니다.');

  const response = await fetch(`${DRIVE_API_BASE}/files/${fileId}?alt=media`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`이미지 다운로드 실패 (${response.status}): ${error}`);
  }

  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(blob);
  });
}

/**
 * Upload a JSON file (e.g. guide backup) to Google Drive.
 */
export async function uploadJsonToDrive(fileName: string, data: unknown): Promise<DriveFileItem> {
  const token = await getAccessToken();
  if (!token) throw new Error('Google 로그인이 필요합니다.');

  const jsonString = JSON.stringify(data, null, 2);
  const metadata = {
    name: fileName,
    mimeType: 'application/json',
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    jsonString +
    closeDelimiter;

  const response = await fetch(`${DRIVE_UPLOAD_BASE}/files?uploadType=multipart`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Drive 파일 업로드 실패 (${response.status}): ${errorText}`);
  }

  return await response.json();
}

/**
 * Upload an Excel file (ArrayBuffer / Blob) to Google Drive.
 */
export async function uploadExcelToDrive(fileName: string, buffer: ArrayBuffer): Promise<DriveFileItem> {
  const token = await getAccessToken();
  if (!token) throw new Error('Google 로그인이 필요합니다.');

  const metadata = {
    name: fileName,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };

  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  form.append(
    'file',
    new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
  );

  const response = await fetch(`${DRIVE_UPLOAD_BASE}/files?uploadType=multipart`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google Drive 엑셀 업로드 실패 (${response.status}): ${error}`);
  }

  return await response.json();
}

/**
 * Delete a file in Google Drive.
 * WARNING: The calling UI MUST prompt the user for confirmation prior to calling this!
 */
export async function deleteDriveFile(fileId: string): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) throw new Error('Google 로그인이 필요합니다.');

  const response = await fetch(`${DRIVE_API_BASE}/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok && response.status !== 204) {
    const error = await response.text();
    throw new Error(`파일 삭제 실패 (${response.status}): ${error}`);
  }

  return true;
}
