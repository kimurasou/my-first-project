import { useState, useCallback } from 'react';
import { ChevronLeft, RotateCcw, Check, Zap, AlertCircle } from 'lucide-react';
import type { Card } from '../types';
import { updateCardAfterReview } from '../store';

interface Props {
  cards: Card[];
  folderName: string;
  onExit: (updatedCards: Card[]) => void;
}

export function StudyMode({ cards, folderName, onExit }: Props) {
  const [deck, setDeck] = useState<Card[]>(() => [...cards].sort(() => Math.random() - 0.5));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [updated, setUpdated] = useState<Card[]>([]);
  const [finished, setFinished] = useState(false);

  const current = deck[index];

  const handleRate = useCallback((quality: 0 | 1 | 2 | 3) => {
    const newCard = updateCardAfterReview(current, quality);
    const newUpdated = [...updated, newCard];
    setUpdated(newUpdated);
    setFlipped(false);
    if (index + 1 >= deck.length) {
      setFinished(true);
    } else {
      setIndex(i => i + 1);
    }
  }, [current, index, deck.length, updated]);

  const restart = () => {
    setDeck([...cards].sort(() => Math.random() - 0.5));
    setIndex(0);
    setFlipped(false);
    setUpdated([]);
    setFinished(false);
  };

  if (finished) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-6 gap-6">
        <div className="text-5xl">🎉</div>
        <h2 className="text-2xl font-bold text-gray-800">セッション完了！</h2>
        <p className="text-gray-600">{deck.length}枚のカードを学習しました</p>
        <div className="flex gap-3">
          <button onClick={restart} className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600">
            <RotateCcw size={18} /> もう一度
          </button>
          <button onClick={() => onExit(updated)} className="flex items-center gap-2 bg-white text-gray-700 border px-6 py-3 rounded-xl font-semibold hover:bg-gray-50">
            <ChevronLeft size={18} /> 戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <button onClick={() => onExit(updated)} className="flex items-center gap-1 text-gray-600 hover:text-gray-900">
          <ChevronLeft size={20} /> 終了
        </button>
        <span className="font-semibold text-gray-700">{folderName}</span>
        <span className="text-sm text-gray-500">{index + 1} / {deck.length}</span>
      </div>

      {/* Progress bar */}
      <div className="mx-4 h-2 bg-white/50 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${((index) / deck.length) * 100}%` }}
        />
      </div>

      {/* Card */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="flip-card w-full max-w-sm">
          <div className={`flip-inner ${flipped ? 'flipped' : ''}`} style={{ minHeight: 280 }}>
            {/* Front */}
            <div
              className="flip-front w-full bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center gap-4 cursor-pointer select-none"
              style={{ minHeight: 280 }}
              onClick={() => !flipped && setFlipped(true)}
            >
              <div className="text-sm font-medium text-blue-500 uppercase tracking-wide">英単語</div>
              <div className="text-4xl font-bold text-gray-900 text-center">{current.english}</div>
              <div className="text-sm text-gray-400 mt-4">タップして答えを確認</div>
            </div>

            {/* Back */}
            <div
              className="flip-back w-full bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center gap-3"
              style={{ minHeight: 280 }}
            >
              <div className="text-sm font-medium text-green-500 uppercase tracking-wide">日本語の意味</div>
              <div className="text-4xl font-bold text-gray-900 text-center">{current.japanese}</div>
              {current.imageData && (
                <img src={current.imageData} alt="" className="w-32 h-32 object-contain rounded-xl mt-2" />
              )}
              <div className="text-sm text-gray-500 mt-1">{current.english}</div>
            </div>
          </div>
        </div>

        {/* Rating buttons (show after flip) */}
        {flipped && (
          <div className="mt-6 w-full max-w-sm">
            <p className="text-center text-sm text-gray-600 mb-3">どのくらい覚えていましたか？</p>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => handleRate(0)}
                className="flex flex-col items-center gap-1 bg-red-100 text-red-700 rounded-xl py-3 px-2 hover:bg-red-200 active:scale-95 transition-all"
              >
                <AlertCircle size={20} />
                <span className="text-xs font-medium">もう一度</span>
              </button>
              <button
                onClick={() => handleRate(1)}
                className="flex flex-col items-center gap-1 bg-orange-100 text-orange-700 rounded-xl py-3 px-2 hover:bg-orange-200 active:scale-95 transition-all"
              >
                <RotateCcw size={20} />
                <span className="text-xs font-medium">難しい</span>
              </button>
              <button
                onClick={() => handleRate(2)}
                className="flex flex-col items-center gap-1 bg-blue-100 text-blue-700 rounded-xl py-3 px-2 hover:bg-blue-200 active:scale-95 transition-all"
              >
                <Check size={20} />
                <span className="text-xs font-medium">まあまあ</span>
              </button>
              <button
                onClick={() => handleRate(3)}
                className="flex flex-col items-center gap-1 bg-green-100 text-green-700 rounded-xl py-3 px-2 hover:bg-green-200 active:scale-95 transition-all"
              >
                <Zap size={20} />
                <span className="text-xs font-medium">簡単</span>
              </button>
            </div>
          </div>
        )}

        {!flipped && (
          <button
            onClick={() => setFlipped(true)}
            className="mt-6 bg-white border-2 border-blue-300 text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-blue-50"
          >
            答えを見る
          </button>
        )}
      </div>
    </div>
  );
}
