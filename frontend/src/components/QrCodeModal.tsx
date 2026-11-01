import React from 'react';
import { X, Download, Printer } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  code: string;
  qrPayload: string;
  subtitle?: string;
}

export const QrCodeModal: React.FC<Props> = ({ isOpen, onClose, title, code, qrPayload, subtitle }) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    const svg = document.getElementById('foodiehut-qr-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20, 360, 360);
      }
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `${code}-QR.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl relative print:shadow-none print:w-full print:max-w-none">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 print:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-slate-800">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}

        <div className="my-6 inline-block p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-brand-200">
          <QRCodeSVG id="foodiehut-qr-svg" value={qrPayload} size={220} level="H" includeMargin={true} />
        </div>

        <div className="bg-brand-50 border border-brand-100 rounded-xl p-3 mb-6">
          <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider block">Unique Code</span>
          <span className="text-2xl font-extrabold text-brand-700 tracking-widest">{code}</span>
        </div>

        <div className="flex gap-3 print:hidden">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-sm transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" /> Download QR
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl text-sm transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" /> Print QR
          </button>
        </div>
      </div>
    </div>
  );
};

