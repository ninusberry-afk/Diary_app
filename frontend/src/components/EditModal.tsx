import {
  useEffect,
  useRef,
  useState,
} from 'react';

import type { DiaryViewEntry } from './DiaryViews';

type MoodType = DiaryViewEntry['mood'];

interface EditModalProps {
  entry: DiaryViewEntry;
  onClose: () => void;
  onSave: (entry: DiaryViewEntry) => void;
  onDelete: (id: string) => void;
}

const moodOptions: Array<{
  value: MoodType;
  emoji: string;
  label: string;
}> = [
  {
    value: 'happy',
    emoji: '😊',
    label: 'うれしい',
  },
  {
    value: 'neutral',
    emoji: '😑',
    label: 'ふつう',
  },
  {
    value: 'tired',
    emoji: '😴',
    label: 'つかれた',
  },
  {
    value: 'sad',
    emoji: '😢',
    label: 'かなしい',
  },
  {
    value: 'angry',
    emoji: '😠',
    label: 'いらいら',
  },
];

const EditModal = ({
  entry,
  onClose,
  onSave,
  onDelete,
}: EditModalProps) => {
  const [mood, setMood] =
    useState<MoodType>(entry.mood);

  const [content, setContent] =
    useState(entry.content);

  const [confirmDelete, setConfirmDelete] =
    useState(false);

  const textareaRef =
    useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener(
      'keydown',
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown,
      );
    };
  }, [onClose]);

  const handleSave = () => {
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      return;
    }

    onSave({
      ...entry,
      mood,
      content: trimmedContent,
    });

    onClose();
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    onDelete(entry.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-stone-900/45 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-diary-title"
        className="w-full sm:max-w-xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 bg-[#faf8f4] border border-stone-200 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2
              id="edit-diary-title"
              className="text-xl font-bold text-stone-800"
            >
              日記を編集
            </h2>

            <p className="text-xs text-stone-400 mt-1">
              {entry.date}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="編集画面を閉じる"
            className="w-10 h-10 rounded-full bg-[#f2efe9] text-stone-400 active:scale-95"
          >
            ✕
          </button>
        </div>

        <fieldset className="mb-5">
          <legend className="text-[11px] text-stone-400 font-mono tracking-widest mb-2">
            MOOD
          </legend>

          <div className="flex flex-wrap gap-2">
            {moodOptions.map((option) => (
              <button
                type="button"
                key={option.value}
                onClick={() =>
                  setMood(option.value)
                }
                aria-label={option.label}
                aria-pressed={
                  mood === option.value
                }
                className={`w-11 h-11 rounded-xl text-xl border-2 transition-all ${
                  mood === option.value
                    ? 'bg-purple-50 border-purple-300 scale-105'
                    : 'bg-[#f2efe9] border-transparent'
                }`}
              >
                {option.emoji}
              </button>
            ))}
          </div>
        </fieldset>

        <textarea
          ref={textareaRef}
          rows={5}
          value={content}
          onChange={(event) =>
            setContent(event.target.value)
          }
          aria-label="日記本文"
          className="block w-full px-4 py-3 mb-5 rounded-2xl text-sm leading-relaxed text-stone-700 bg-[#f2efe9] border border-stone-200 outline-none resize-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
        />

        <button
          type="button"
          onClick={handleSave}
          disabled={!content.trim()}
          className="w-full py-3.5 rounded-2xl font-bold bg-purple-300 text-white disabled:bg-stone-200 disabled:text-stone-400 active:scale-[0.98]"
        >
          保存する ✓
        </button>

        <button
          type="button"
          onClick={handleDelete}
          className={`w-full py-3 mt-2 rounded-2xl text-sm font-bold border transition-colors ${
            confirmDelete
              ? 'bg-red-400 border-red-400 text-white'
              : 'bg-red-50 border-red-200 text-red-400'
          }`}
        >
          {confirmDelete
            ? '本当に削除する'
            : '削除する'}
        </button>
      </div>
    </div>
  );
};

export default EditModal;