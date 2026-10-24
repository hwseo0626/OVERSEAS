import React, { useRef, useState, useEffect } from 'react';
import { X, Camera, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

interface CameraBarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBarcodeDetected: (barcode: string) => void;
}

export const CameraBarcodeScannerModal: React.FC<CameraBarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onBarcodeDetected,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setErrorMsg('');
    setIsScanning(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('이 브라우저는 카메라 스트림을 지원하지 않습니다.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setErrorMsg('카메라에 접근할 수 없습니다. 권한 설정을 확인해 주세요.');
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  const handleSimulateScan = (code: string) => {
    onBarcodeDetected(code);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <Camera className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-base font-bold">카메라 바코드 스캐너</h2>
              <p className="text-xs text-slate-400">카메라를 제품 바코드에 맞춰주세요</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Viewfinder */}
        <div className="p-6 flex flex-col items-center justify-center space-y-4">
          <div className="relative w-full h-64 bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center">
            {errorMsg ? (
              <div className="p-6 text-center text-white space-y-2">
                <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                <p className="text-xs font-semibold">{errorMsg}</p>
                <p className="text-[11px] text-slate-400">
                  아래 샘플 바코드를 터치하여 테스트할 수 있습니다.
                </p>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {/* Aiming Reticle Overlay */}
                <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-28 border-2 border-red-500 rounded-xl pointer-events-none flex flex-col items-center justify-between p-2 shadow-2xl">
                  <div className="w-full flex justify-between">
                    <span className="w-3 h-3 border-t-2 border-l-2 border-red-500" />
                    <span className="w-3 h-3 border-t-2 border-r-2 border-red-500" />
                  </div>
                  <div className="w-full h-0.5 bg-red-500/80 animate-pulse shadow-sm" />
                  <div className="w-full flex justify-between">
                    <span className="w-3 h-3 border-b-2 border-l-2 border-red-500" />
                    <span className="w-3 h-3 border-b-2 border-r-2 border-red-500" />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Simulation Options */}
          <div className="w-full space-y-2">
            <span className="text-[11px] font-bold text-slate-500 block">
              카메라 대신 원클릭 스캔 테스트:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleSimulateScan('8801234567890')}
                className="p-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold border border-slate-200 text-left transition flex items-center justify-between"
              >
                <span>[D-R-O] 케이스</span>
                <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
              </button>
              <button
                type="button"
                onClick={() => handleSimulateScan('8801234567891')}
                className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold border border-slate-200 text-left transition flex items-center justify-between"
              >
                <span>[ROA] 바코드 가림</span>
                <CheckCircle className="w-3.5 h-3.5 text-rose-500" />
              </button>
              <button
                type="button"
                onClick={() => handleSimulateScan('8801234567892')}
                className="p-2 rounded-xl bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 font-bold border border-slate-200 text-left transition flex items-center justify-between"
              >
                <span>[ELEMENT] 65X44</span>
                <CheckCircle className="w-3.5 h-3.5 text-purple-500" />
              </button>
              <button
                type="button"
                onClick={() => handleSimulateScan('8801234567894')}
                className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold border border-slate-200 text-left transition flex items-center justify-between"
              >
                <span>[TAICHEONG] 앞면</span>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
