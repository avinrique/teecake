import React from 'react';
import { Lock, Edit3, Eye } from 'lucide-react';
import { useEditMode } from '../context/EditModeContext';

export const EditorModeToggle: React.FC = () => {
  const { isEditMode, isAdmin, toggleEditMode, logout } = useEditMode();
  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2">
      {isAdmin && <button type="button" onClick={logout} className="rounded-full bg-white text-[#5e2632] border px-4 py-2 text-xs shadow-lg">Sign out</button>}
      <button type="button" onClick={toggleEditMode} className="flex items-center gap-2 rounded-full bg-[#9e4c5b] text-white px-4 py-2 text-xs shadow-lg">
        {isAdmin ? (isEditMode ? <Eye size={16} /> : <Edit3 size={16} />) : <Lock size={16} />}
        {isAdmin ? (isEditMode ? 'View website' : 'Edit website') : 'Admin sign in'}
      </button>
    </div>
  );
};
