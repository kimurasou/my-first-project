import { useState, useMemo } from 'react';
import { ChevronLeft, Check, X } from 'lucide-react';
import type { Card } from '../types';

interface Props {
  cards: Card[];
  folderName: string;
  onExit: () => void;
}

interface Question {
  card: Card;
  choices: string[];
  correctIndex: number;
}

function buildQuestions(cards: Card[]): Question[] {
  const shuffled = [...cards].sort(() => Math.random() - 0.5);
  return shuffled.map(card => {
    const others = cards
      .filter(c => c.id !== card.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(c => c.japanese);
    const choices = [...others, card.japanese].sort(() => Math.random() - 0.5);
    return {
      card,
      choices,
      correctIndex: choices.indexOf(card.japanese),
    };
  });
}

export function TestMode({ cards, folderName, onExit }: Props) {
  const questions = useMemo(() => buildQuestions(cards), [cards]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [results, setResults] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);

  const q = questions[index];

  const handleSelect = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    const correct = i === q.correctIndex;
    const newResults = [...results, correct];
    setResults(newResults);
  };

  const next = () => {
    if (index + 1 >= questions.length) {
      setFinished(true);
    } else {
      setIndex(i => i + 1);
      setSelected(null);
    }
  };

  const restart = () => {
    setIndex(0);
    setSelected(null);
    setResults([]);
    setFinished(false);
  };

  const score = results.filter(Boolean).length;

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex flex-col items-center justify-center p-6 gap-6">
        <div className="text-5xl">{pct >= 80 ? '🏆' : pct >= 60 ? '👍' : '💪'}</div>
        <h2 className="text-2xl font-bold text-gray-800">テスト結果</h2>
        <div className="bg-white rounded-2xl shadow p-8 text-center w-full max-w-xs">
          <div className="text-5xl font-bold text-purple-600">{pct}%</div>
          <div className="text-gray-500 mt-2">{score} / {questions.length} 正解</div>
          <div className="mt-4 space-y-1">
            {results.map((r, i) => (
              <div key={i} className={`flex items-center gap-2 text-sm ${r ? 'text-green-600' : 'text-red-500'}`}>
                {r ? <Check size={14} /> : <X size={14} />}
                <span>{questions[i].card.english}</span>
                {!r && <span className="text-gray-400">→ {questions[i].card.japanese}</span>}
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={restart} className="bg-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-600">
            もう一度
          </button>
          <button onClick={onExit} className="bg-white text-gray-700 border px-6 py-3 rounded-xl font-semibold hover:bg-gray-50">
            <ChevronLeft size={18} className="inline" /> 戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <button onClick={onExit} className="flex items-center gap-1 text-gray-600 hover:text-gray-900">
          <ChevronLeft size={20} /> 終了
        </button>
        <span className="font-semibold text-gray-700">{folderName} — テスト</span>
        <span className="text-sm text-gray-500">{index + 1} / {questions.length}</span>
      </div>

      {/* Progress */}
      <div className="mx-4 h-2 bg-white/50 rounded-full overflow-hidden">
        <div
          className="h-full bg-purple-500 rounded-full transition-all duration-300"
          style={{ width: `${((index) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm text-center">
          <div className="text-xs text-purple-500 font-medium uppercase tracking-wide mb-3">次の英単語の意味は？</div>
          <div className="text-4xl font-bold text-gray-900">{q.card.english}</div>
          {q.card.imageData && selected !== null && (
            <img src={q.card.imageData} alt="" className="w-24 h-24 object-contain mx-auto mt-3 rounded-lg" />
          )}
        </div>

        {/* Choices */}
        <div className="w-full max-w-sm space-y-3">
          {q.choices.map((choice, i) => {
            let cls = 'w-full text-left bg-white border-2 rounded-xl px-4 py-3.5 font-medium transition-all ';
            if (selected === null) {
              cls += 'border-gray-200 hover:border-purple-400 hover:bg-purple-50 active:scale-98';
            } else if (i === q.correctIndex) {
              cls += 'border-green-500 bg-green-50 text-green-700';
            } else if (i === selected && selected !== q.correctIndex) {
              cls += 'border-red-400 bg-red-50 text-red-700';
            } else {
              cls += 'border-gray-200 opacity-50';
            }

            return (
              <button key={i} className={cls} onClick={() => handleSelect(i)}>
                <span className="text-gray-400 mr-2">{['A', 'B', 'C', 'D'][i]}.</span>
                {choice}
                {selected !== null && i === q.correctIndex && (
                  <Check size={16} className="inline ml-2 text-green-600" />
                )}
                {selected === i && i !== q.correctIndex && (
                  <X size={16} className="inline ml-2 text-red-500" />
                )}
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <button
            onClick={next}
            className="w-full max-w-sm bg-purple-500 text-white rounded-xl py-3.5 font-semibold hover:bg-purple-600"
          >
            {index + 1 >= questions.length ? '結果を見る' : '次の問題'}
          </button>
        )}
      </div>
    </div>
  );
}
