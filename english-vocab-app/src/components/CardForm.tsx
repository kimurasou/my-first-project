import { useState, useRef } from 'react';
import { X, Image, Plus } from 'lucide-react';
import type { Card } from '../types';

interface Props {
  folderId: string;
  card?: Card;
  onSave: (english: string, japanese: string, imageData?: string) => void;
  onClose: () => void;
}

export function CardForm({ folderId: _folderId, card, onSave, onClose }: Props) {
  const [english, setEnglish] = useState(card?.english ?? '');
  const [japanese, setJapanese] = useState(card?.japanese ?? '');
  const [imageData, setImageData] = useState<string | undefined>(card?.imageData);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageData(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!english.trim() || !japanese.trim()) return;
    onSave(english.trim(), japanese.trim(), imageData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{card ? 'カードを編集' : 'カードを追加'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">英単語</label>
            <input
              type="text"
              value={english}
              onChange={e => setEnglish(e.target.value)}
              placeholder="例: apple"
              className="w-full border rounded-xl px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">日本語の意味</label>
            <input
              type="text"
              value={japanese}
              onChange={e => setJapanese(e.target.value)}
              placeholder="例: りんご"
              className="w-full border rounded-xl px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">画像（任意）</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-blue-400 transition-colors"
            >
              {imageData ? (
                <div className="relative w-full">
                  <img src={imageData} alt="" className="w-full h-40 object-contain rounded-lg" />
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); setImageData(undefined); }}
                    className="absolute top-1 right-1 bg-white rounded-full p-1 shadow"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <Image size={32} className="text-gray-400" />
                  <span className="text-sm text-gray-500">タップして画像を選択</span>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
          </div>
          <button
            type="submit"
            disabled={!english.trim() || !japanese.trim()}
            className="w-full bg-blue-500 text-white rounded-xl py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 active:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            {card ? '更新する' : '追加する'}
          </button>
        </form>
      </div>
    </div>
  );
}
