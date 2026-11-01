import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, Camera, Keyboard, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const QrScannerModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [manualCode, setManualCode] = useState('');
  const [isManualMode, setIsManualMode] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const navigate = useNavigate();

  const handleResolveCode = async (rawInput: string) => {
    let cleanCode = rawInput.trim();
    // If it's a URL like https://.../canteen/CAN-XXXXXX extract the last part
    if (cleanCode.includes('/canteen/')) {
      cleanCode = cleanCode.substring(cleanCode.lastIndexOf('/canteen/') + 9);
    }
    cleanCode = cleanCode.toUpperCase();

    setErrorMsg(null);
    setLoading(true);
    try {
      const canteen = await api.getCanteenByCode(cleanCode);
      if (!canteen.active) {
        setErrorMsg(`Canteen ${canteen.canteenName} is currently inactive.`);
        setLoading(false);
        return;
      }
      onClose();
      navigate(`/canteen/${cleanCode}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Canteen not found with code: ' + cleanCode);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen || isManualMode) return;

    let timeoutId = setTimeout(() => {
      try {
        const scanner = new Html5QrcodeScanner(
          'qr-reader-container',
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          false
        );

        scanner.render(
          (decodedText) => {
            scanner.clear().catch(console.error);
            handleResolveCode(decodedText);
          },
          (error) => {
            // Scanner frame scan failure (ignore harmless scanning ticks)
          }
        );

        scannerRef.current = scanner;
      } catch (err) {
        console.error('Camera initialization error:', err);
        setIsManualMode(true);
      }
    }, 200);

    return () => {
      clearTimeout(timeoutId);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [isOpen, isManualMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-slate-800">Scan Canteen QR</h3>
          <p className="text-sm text-slate-500">Scan QR from canteen counter or enter code</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {!isManualMode ? (
          <div>
            <div id="qr-reader-container" className="w-full rounded-2xl overflow-hidden border border-slate-200" />
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  if (scannerRef.current) scannerRef.current.clear().catch(console.error);
                  setIsManualMode(true);
                }}
                className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center justify-center gap-2 mx-auto"
              >
                <Keyboard className="w-4 h-4" /> Enter Canteen Code Manually
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (manualCode.trim()) handleResolveCode(manualCode);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Canteen Unique Code
              </label>
              <input
                type="text"
                placeholder="e.g. CAN-8F42K9"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl font-mono text-center text-lg tracking-widest focus:ring-2 focus:ring-brand-500 focus:outline-none uppercase"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading || !manualCode.trim()}
              className="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-colors"
            >
              {loading ? 'Finding Canteen...' : 'Open Canteen Menu'}
            </button>
            <button
              type="button"
              onClick={() => setIsManualMode(false)}
              className="w-full text-center text-sm font-semibold text-slate-500 hover:text-slate-800 flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4" /> Switch Back to Camera Scan
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
