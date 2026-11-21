import { useEditMode } from '../context/EditModeContext';
import React, { useState } from 'react';
import { X, Check, Copy, ExternalLink, Cloud, RefreshCw, Users, ShieldCheck, Sparkles } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncNow: () => Promise<boolean>;
  isSyncing: boolean;
  lastSyncedTime: string | null;
  itemsCount: number;
  signatureCount: number;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  onSyncNow,
  isSyncing,
  lastSyncedTime,
  itemsCount,
  signatureCount,
}) => {
  const { isAdmin } = useEditMode();
  const [copied, setCopied] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  if (!isOpen) return null;

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}?mode=view` : '';

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const input = document.createElement('input');
        input.value = shareUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('Copy failed:', err);
    }
  };

  const handleForceSync = async () => {
    const success = await onSyncNow();
    if (success) {
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#fffdfb] border border-[#e4b3bc] rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden p-6 sm:p-7 relative animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-[#faeaee] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-[#ebd0d6]">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#faeaee] to-[#f5d5dc] border border-[#e4b3bc] flex items-center justify-center text-[#9e4c5b] shadow-2xs">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#541e2a] font-serif-display leading-tight">
              Share with Friends & Visitors
            </h2>
            <p className="text-xs text-[#85545e] mt-0.5">
              Public Live Preview link for anyone to view without logging in
            </p>
          </div>
        </div>

        {/* Share Link Box */}
        <div className="mb-5 space-y-1.5">
          <label className="text-xs font-bold text-[#541e2a] block">
            Public View Link (Send This Link to Friends):
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 text-xs font-mono px-3 py-2.5 rounded-xl border border-[#ebd0d6] bg-[#faf6f7] text-[#541e2a] focus:outline-none select-all"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-[#9e4c5b] hover:bg-[#853c49] text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
          <p className="text-[11px] text-stone-500">
            Anyone who opens this link can view all your {itemsCount} creations and custom wallpapers in any browser.
          </p>
        </div>

        {/* Status Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#fef5f7] to-[#fff8f5] border border-[#ebd0d6] mb-5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-[#4a1c26]">
                All {itemsCount} Creations & Wallpapers Ready
              </span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-300">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Publicly Available
            </span>
          </div>

          {lastSyncedTime && (
            <p className="text-[10px] text-[#915f69]">
              Last disk snapshot: {lastSyncedTime}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#ebd0d6]">
          {isAdmin && <button
            onClick={handleForceSync}
            disabled={isSyncing}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-[#5e2632] bg-[#faeaee] hover:bg-[#f5dbe1] border border-[#e4b3bc] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            title="Upload current local state to server cloud database"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#9e4c5b] ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Saving to Disk...' : syncSuccess ? '✓ Saved to Disk!' : 'Save & Sync to Disk'}</span>
          </button>}

          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Public App</span>
          </a>
        </div>
      </div>
    </div>
  );
};
