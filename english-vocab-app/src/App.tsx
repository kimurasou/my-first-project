import { useState, useCallback } from 'react';
import { Folder, Plus, BookOpen, ClipboardList, Pencil, Trash2, ChevronRight, X, Check } from 'lucide-react';
import type { Folder as FolderType, Card, Screen } from './types';
import {
  loadFolders, saveFolders, loadCards, saveCards,
  createFolder, createCard,
} from './store';
import { CardForm } from './components/CardForm';
import { StudyMode } from './components/StudyMode';
import { TestMode } from './components/TestMode';

export default function App() {
  const [folders, setFolders] = useState<FolderType[]>(loadFolders);
  const [cards, setCards] = useState<Card[]>(loadCards);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>('home');
  const [showCardForm, setShowCardForm] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | undefined>(undefined);
  const [showFolderInput, setShowFolderInput] = useState(false);
  const [folderInputValue, setFolderInputValue] = useState('');
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const activeFolder = folders.find(f => f.id === activeFolderId);
  const folderCards = cards.filter(c => c.folderId === activeFolderId);

  const persistFolders = (updated: FolderType[]) => {
    setFolders(updated);
    saveFolders(updated);
  };
  const persistCards = (updated: Card[]) => {
    setCards(updated);
    saveCards(updated);
  };

  const handleAddFolder = () => {
    const name = folderInputValue.trim();
    if (!name) return;
    const folder = createFolder(name);
    persistFolders([...folders, folder]);
    setFolderInputValue('');
    setShowFolderInput(false);
    setActiveFolderId(folder.id);
  };

  const handleRenameFolder = (id: string) => {
    const name = editingFolderName.trim();
    if (!name) return;
    persistFolders(folders.map(f => f.id === id ? { ...f, name } : f));
    setEditingFolderId(null);
  };

  const handleDeleteFolder = (id: string) => {
    persistFolders(folders.filter(f => f.id !== id));
    persistCards(cards.filter(c => c.folderId !== id));
    if (activeFolderId === id) setActiveFolderId(null);
    setDeleteConfirmId(null);
  };

  const handleSaveCard = useCallback((english: string, japanese: string, imageData?: string) => {
    if (!activeFolderId) return;
    if (editingCard) {
      persistCards(cards.map(c => c.id === editingCard.id
        ? { ...editingCard, english, japanese, imageData }
        : c
      ));
    } else {
      const card = createCard(activeFolderId, english, japanese, imageData);
      persistCards([...cards, card]);
    }
    setShowCardForm(false);
    setEditingCard(undefined);
  }, [activeFolderId, editingCard, cards]);

  const handleDeleteCard = (id: string) => {
    persistCards(cards.filter(c => c.id !== id));
  };

  const handleStudyExit = (updatedCards: Card[]) => {
    const updatedIds = new Set(updatedCards.map(c => c.id));
    persistCards(cards.map(c => updatedIds.has(c.id) ? updatedCards.find(u => u.id === c.id)! : c));
    setScreen('home');
  };

  if (screen === 'study' && activeFolder) {
    return <StudyMode cards={folderCards} folderName={activeFolder.name} onExit={handleStudyExit} />;
  }
  if (screen === 'test' && activeFolder) {
    return <TestMode cards={folderCards} folderName={activeFolder.name} onExit={() => setScreen('home')} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          {activeFolderId ? (
            <button onClick={() => setActiveFolderId(null)} className="text-blue-500 font-medium flex items-center gap-1">
              <ChevronRight size={16} className="rotate-180" /> フォルダ
            </button>
          ) : null}
          <h1 className="text-xl font-bold text-gray-900 flex-1 truncate">
            {activeFolder ? activeFolder.name : '英単語帳'}
          </h1>
          {activeFolder && (
            <div className="flex gap-2">
              <button
                onClick={() => { setShowCardForm(true); setEditingCard(undefined); }}
                className="bg-blue-500 text-white rounded-xl px-3 py-1.5 text-sm font-semibold flex items-center gap-1 hover:bg-blue-600"
              >
                <Plus size={16} /> 追加
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto w-full px-4 py-4 flex-1">
        {/* Folder list view */}
        {!activeFolderId && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500 font-medium">フォルダ一覧</span>
              <button
                onClick={() => setShowFolderInput(true)}
                className="flex items-center gap-1 text-blue-500 font-medium text-sm hover:text-blue-600"
              >
                <Plus size={16} /> 新規フォルダ
              </button>
            </div>

            {showFolderInput && (
              <div className="bg-white border rounded-2xl p-4 shadow-sm flex gap-2">
                <input
                  autoFocus
                  type="text"
                  value={folderInputValue}
                  onChange={e => setFolderInputValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddFolder()}
                  placeholder="フォルダ名を入力"
                  className="flex-1 border rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button onClick={handleAddFolder} className="bg-blue-500 text-white rounded-xl px-4 py-2 font-semibold hover:bg-blue-600">
                  <Check size={18} />
                </button>
                <button onClick={() => { setShowFolderInput(false); setFolderInputValue(''); }} className="text-gray-400 hover:text-gray-600 px-2">
                  <X size={18} />
                </button>
              </div>
            )}

            {folders.length === 0 && !showFolderInput && (
              <div className="text-center py-16 text-gray-400">
                <Folder size={48} className="mx-auto mb-4 opacity-50" />
                <p className="font-medium">フォルダがありません</p>
                <p className="text-sm mt-1">「新規フォルダ」を作成して始めましょう</p>
              </div>
            )}

            {folders.map(folder => {
              const count = cards.filter(c => c.folderId === folder.id).length;
              const isEditing = editingFolderId === folder.id;
              const isDeleteConfirm = deleteConfirmId === folder.id;

              return (
                <div
                  key={folder.id}
                  className="bg-white border rounded-2xl shadow-sm overflow-hidden"
                >
                  {isEditing ? (
                    <div className="p-4 flex gap-2">
                      <input
                        autoFocus
                        type="text"
                        value={editingFolderName}
                        onChange={e => setEditingFolderName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleRenameFolder(folder.id)}
                        className="flex-1 border rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button onClick={() => handleRenameFolder(folder.id)} className="bg-blue-500 text-white rounded-xl px-3 py-2"><Check size={16} /></button>
                      <button onClick={() => setEditingFolderId(null)} className="text-gray-400 px-2"><X size={16} /></button>
                    </div>
                  ) : isDeleteConfirm ? (
                    <div className="p-4 flex items-center gap-3">
                      <span className="flex-1 text-sm text-gray-700">「{folder.name}」と{count}枚のカードを削除しますか？</span>
                      <button onClick={() => handleDeleteFolder(folder.id)} className="bg-red-500 text-white rounded-xl px-3 py-2 text-sm font-semibold">削除</button>
                      <button onClick={() => setDeleteConfirmId(null)} className="text-gray-400 px-2"><X size={16} /></button>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <button
                        className="flex-1 flex items-center gap-3 p-4 text-left hover:bg-gray-50 active:bg-gray-100"
                        onClick={() => setActiveFolderId(folder.id)}
                      >
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Folder size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{folder.name}</div>
                          <div className="text-sm text-gray-400">{count}枚</div>
                        </div>
                        <ChevronRight size={16} className="ml-auto text-gray-400" />
                      </button>
                      <div className="flex gap-1 pr-3">
                        <button onClick={() => { setEditingFolderId(folder.id); setEditingFolderName(folder.name); }} className="p-2 text-gray-400 hover:text-blue-500 rounded-lg">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => setDeleteConfirmId(folder.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Card list view */}
        {activeFolderId && (
          <div className="space-y-3">
            {/* Study / Test buttons */}
            {folderCards.length >= 1 && (
              <div className="grid grid-cols-2 gap-3 mb-2">
                <button
                  onClick={() => setScreen('study')}
                  className="flex items-center justify-center gap-2 bg-blue-500 text-white rounded-2xl py-3.5 font-semibold hover:bg-blue-600 shadow-sm"
                >
                  <BookOpen size={18} /> 学習する
                </button>
                <button
                  disabled={folderCards.length < 2}
                  onClick={() => setScreen('test')}
                  className="flex items-center justify-center gap-2 bg-purple-500 text-white rounded-2xl py-3.5 font-semibold hover:bg-purple-600 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ClipboardList size={18} /> テスト
                </button>
              </div>
            )}

            {folderCards.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
                <p className="font-medium">カードがありません</p>
                <p className="text-sm mt-1">「追加」ボタンでカードを作成しましょう</p>
              </div>
            )}

            {folderCards.map(card => (
              <div key={card.id} className="bg-white border rounded-2xl shadow-sm flex overflow-hidden">
                {card.imageData && (
                  <img src={card.imageData} alt="" className="w-20 h-20 object-cover flex-shrink-0" />
                )}
                <div className="flex-1 p-4 min-w-0">
                  <div className="font-bold text-lg text-gray-900 truncate">{card.english}</div>
                  <div className="text-gray-600 truncate">{card.japanese}</div>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`w-2 h-2 rounded-full ${i < card.level ? 'bg-green-400' : 'bg-gray-200'}`} />
                    ))}
                    <span className="text-xs text-gray-400 ml-1">Lv.{card.level}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 justify-center pr-3">
                  <button
                    onClick={() => { setEditingCard(card); setShowCardForm(true); }}
                    className="p-2 text-gray-400 hover:text-blue-500 rounded-lg"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDeleteCard(card.id)}
                    className="p-2 text-gray-400 hover:text-red-500 rounded-lg"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Card Form Modal */}
      {showCardForm && activeFolderId && (
        <CardForm
          folderId={activeFolderId}
          card={editingCard}
          onSave={handleSaveCard}
          onClose={() => { setShowCardForm(false); setEditingCard(undefined); }}
        />
      )}
    </div>
  );
}
