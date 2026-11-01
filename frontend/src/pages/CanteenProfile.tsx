import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Canteen } from '../types';
import { QrCodeModal } from '../components/QrCodeModal';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Printer, Store, MapPin, Mail, Phone, AlignLeft, ShieldCheck } from 'lucide-react';

export const CanteenProfile: React.FC = () => {
  const { user, profile } = useAuth();
  const canteen = profile as Canteen;
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  if (!canteen) {
    return <div className="p-8 text-center text-slate-500">Loading canteen profile...</div>;
  }

  const qrPayload = `${window.location.origin}/canteen/${canteen.canteenCode}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Left: Info */}
        <div className="flex-1 space-y-4 text-center md:text-left">
          <div className="w-16 h-16 rounded-3xl bg-slate-900 text-white font-extrabold text-2xl flex items-center justify-center mx-auto md:mx-0 shadow-lg">
            <Store className="w-8 h-8 text-brand-400" />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">{canteen.canteenName}</h1>
            <span className="inline-block mt-1 font-mono text-sm font-extrabold text-brand-700 bg-brand-50 px-3 py-1 rounded-xl border border-brand-200">
              {canteen.canteenCode}
            </span>
          </div>

          {canteen.description && (
            <p className="text-xs text-slate-500 leading-relaxed max-w-md">{canteen.description}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 pt-2">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>{canteen.email}</span>
            </div>
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>{canteen.phone}</span>
            </div>
            {canteen.address && (
              <div className="flex items-center gap-2 justify-center md:justify-start col-span-1 sm:col-span-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{canteen.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Counter QR display */}
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 text-center shrink-0 w-full sm:w-auto">
          <div className="inline-block p-4 bg-white rounded-2xl shadow-sm border border-slate-200">
            <QRCodeSVG value={qrPayload} size={180} level="H" includeMargin={true} />
          </div>

          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-3">
            Counter Ordering QR
          </span>

          <button
            onClick={() => setIsQrModalOpen(true)}
            className="mt-4 w-full py-2.5 px-4 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-md shadow-brand-500/20"
          >
            <Download className="w-3.5 h-3.5" /> Download / Print QR
          </button>
        </div>
      </div>

      <QrCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        title="Canteen Counter QR"
        subtitle={canteen.canteenName}
        code={canteen.canteenCode}
        qrPayload={qrPayload}
      />
    </div>
  );
};
