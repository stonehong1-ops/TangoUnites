import React, { useState, useEffect } from 'react';
import { Group, Venue, User, UserRole } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { ImageUploader } from './CreatePost';

interface AddGroupModalProps {
  clubs: Venue[];
  onClose: () => void;
  onSaveGroup: (group: Omit<Group, 'id' | 'memberIds' | 'createdAt' | 'creatorId'> | Group) => void;
  groupToEdit?: Group | null;
  onDeleteGroup?: (groupId: string) => void;
  currentUser: User | null;
}

const AddGroupModal: React.FC<AddGroupModalProps> = ({ clubs, onClose, onSaveGroup, groupToEdit, onDeleteGroup, currentUser }) => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [clubId, setClubId] = useState<string>('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [joinMethod, setJoinMethod] = useState<'approval' | 'open' | 'invite'>('approval');
  
  const isEditMode = !!groupToEdit;

  useEffect(() => {
    if (isEditMode && groupToEdit) {
      setName(groupToEdit.name);
      setDescription(groupToEdit.description);
      setClubId(groupToEdit.clubId || '');
      setImageUrls(groupToEdit.imageUrls);

      if (groupToEdit.isInviteOnly) {
        setJoinMethod('invite');
      } else if (groupToEdit.requiresApproval) {
        setJoinMethod('approval');
      } else {
        setJoinMethod('open');
      }

    } else {
      setName('');
      setDescription('');
      setClubId('');
      setImageUrls([]);
      setJoinMethod('approval');
    }
  }, [groupToEdit, isEditMode]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description) {
      alert(t('fillAllFields'));
      return;
    }
    if (imageUrls.length === 0) {
        alert(t('photoRequired'));
        return;
    }
    const groupData = {
      name,
      description,
      clubId: clubId || undefined,
      imageUrls,
      requiresApproval: joinMethod === 'approval' || joinMethod === 'invite',
      isPublic: false,
      isAnonymous: false,
      isInviteOnly: joinMethod === 'invite',
    };

    if (isEditMode) {
        onSaveGroup({
            ...groupToEdit,
            ...groupData,
        });
    } else {
        onSaveGroup(groupData);
    }
  };

  const handleDelete = () => {
    if (isEditMode && onDeleteGroup && window.confirm(t('deleteGroupConfirmation'))) {
        onDeleteGroup(groupToEdit.id);
        onClose();
    }
  };

  const inputClass = "w-full bg-gray-50 text-gray-900 rounded-md p-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder-gray-400";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60] p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white border border-gray-200 rounded-lg shadow-xl p-6 w-full max-w-md mx-auto transform transition-all max-h-[90vh] overflow-y-auto scrollbar-hide"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          {isEditMode ? t('editGroupInfo') : t('newGroup')}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className={labelClass}>{t('groupName')}</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} required />
            </div>
             <div>
                <label className={labelClass}>{t('groupDescription')}</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} className={inputClass} rows={3} required></textarea>
            </div>
            <div>
                <label className={labelClass}>{t('associatedVenue')}</label>
                <select value={clubId} onChange={e => setClubId(e.target.value)} className={inputClass}>
                    <option value="">{t('noVenue')}</option>
                    {clubs.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
            </div>
            <ImageUploader imageUrls={imageUrls} setImageUrls={setImageUrls} maxImages={10} />
            
            <div>
                <label className={labelClass}>{t('joinMethod')}</label>
                <div className="space-y-2 rounded-md bg-gray-50 p-3 border">
                    <label className="block p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                        <div className="flex items-center gap-3">
                            <input type="radio" name="joinMethod" checked={joinMethod === 'approval'} onChange={() => setJoinMethod('approval')} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"/>
                            <span className="text-sm font-medium text-gray-800">{t('approvalRequired')}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 pl-7">{t('joinMethodApprovalDesc')}</p>
                    </label>
                     <label className="block p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                        <div className="flex items-center gap-3">
                            <input type="radio" name="joinMethod" checked={joinMethod === 'open'} onChange={() => setJoinMethod('open')} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"/>
                            <span className="text-sm font-medium text-gray-800">{t('openToAll')}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 pl-7">{t('joinMethodOpenDesc')}</p>
                    </label>
                    <label className="block p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                        <div className="flex items-center gap-3">
                            <input type="radio" name="joinMethod" checked={joinMethod === 'invite'} onChange={() => setJoinMethod('invite')} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"/>
                            <span className="text-sm font-medium text-gray-800">{t('joinMethodInvite')}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 pl-7">{t('joinMethodInviteDesc')}</p>
                    </label>
                </div>
            </div>

            <div className="flex justify-between items-center pt-4">
                 <div>
                    {isEditMode && onDeleteGroup && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="py-2 px-6 rounded-full text-red-500 border border-red-500 hover:bg-red-500/10 transition"
                        >
                            {t('delete')}
                        </button>
                    )}
                </div>
                <div className="flex space-x-4">
                    <button type="button" onClick={onClose} className="py-2 px-6 rounded-full text-gray-700 bg-gray-200 hover:bg-gray-300 transition">{t('cancel')}</button>
                    <button type="submit" className="py-2 px-6 rounded-full text-white bg-blue-600 hover:bg-blue-700 font-bold transition">
                       {isEditMode ? t('saveChanges') : t('add')}
                    </button>
                </div>
            </div>
        </form>
      </div>
    </div>
  );
};

export default AddGroupModal;