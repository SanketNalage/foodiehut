import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Student } from '../types';
import { QrCodeModal } from '../components/QrCodeModal';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Printer, User, School, Hash, Layers, Mail, Phone, ShieldCheck } from 'lucide-react';

export const StudentProfile: React.FC = () => {
  const { user, profile } = useAuth();
  const student = profile as Student;
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  if (!student) {
    return <div className="p-8 text-center text-slate-500">Loading student profile...</div>;
  }

  const qrPayload = `${window.location.origin}/student/${student.studentCode}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Left: Info */}
        <div className="flex-1 space-y-4 text-center md:text-left">
          <div className="w-16 h-16 rounded-3xl bg-brand-500 text-white font-extrabold text-2xl flex items-center justify-center mx-auto md:mx-0 shadow-lg shadow-brand-500/25">
            {user?.fullName?.charAt(0) || 'S'}
          </div>

          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">{user?.fullName}</h1>
            <span className="inline-block mt-1 font-mono text-sm font-extrabold text-brand-600 bg-brand-50 px-3 py-1 rounded-xl border border-brand-200">
              {student.studentCode}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 pt-2">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>{user?.phone}</span>
            </div>
            {student.college && (
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <School className="w-4 h-4 text-slate-400" />
                <span>{student.college}</span>
              </div>
            )}
            {student.studentIdNumber && (
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Hash className="w-4 h-4 text-slate-400" />
                <span>ID: {student.studentIdNumber}</span>
              </div>
            )}
            {student.section && (
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Layers className="w-4 h-4 text-slate-400" />
                <span>Section: {student.section}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: QR Code card */}
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 text-center shrink-0 w-full sm:w-auto">
          <div className="inline-block p-3 bg-white rounded-2xl shadow-sm border border-slate-200">
            <QRCodeSVG value={qrPayload} size={160} level="H" includeMargin={true} />
          </div>

          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-3">
            Your Student QR
          </span>

          <button
            onClick={() => setIsQrModalOpen(true)}
            className="mt-4 w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> View / Download QR
          </button>
        </div>
      </div>

      <QrCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        title="Student QR Code"
        subtitle={user?.fullName}
        code={student.studentCode}
        qrPayload={qrPayload}
      />
    </div>
  );
};
