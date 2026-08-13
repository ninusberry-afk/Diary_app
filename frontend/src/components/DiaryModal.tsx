import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react';

export type MoodType =
  | 'happy'
  | 'tired'
  | 'sad'
  | 'angry'
  | 'neutral';

export interface DiaryEntry {
  id: string;
  date: string;
  mood: MoodType;
  content: string;
  createdAt: string;
}

interface DiaryModalProps {
  onClose: () => void;
  onSave: (entry: DiaryEntry) => void;
  defaultDate?: string;
}

const moodOptions: Array<{
  value: MoodType;
  emoji: string;
  label: string;
}> = [
  { value: 'happy', emoji: '😊', label: 'げんき' },
  { value: 'neutral', emoji: '😑', label: 'ふつう' },
  { value: 'tired', emoji: '😴', label: 'つかれた' },
  { value: 'sad', emoji: '😢', label: 'かなしい' },
  { value: 'angry', emoji: '😠', label: 'いらいら' },
];

// UTCではなく、利用者の端末における当日をYYYY-MM-DDで返す
const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const DiaryModal = ({
  onClose,
  onSave,
  defaultDate,
}: DiaryModalProps) => {
  const [date, setDate] = useState(defaultDate ?? getTodayDate());
  const [mood, setMood] = useState<MoodType>('tired');
  const [content, setContent] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedContent = content.trim();

    if (!trimmedContent || !date) {
      return;
    }

    onSave({
      id: Date.now().toString(),
      date,
      mood,
      content: trimmedContent,
      createdAt: new Date().toISOString(),
    });

    onClose();
  };

  const canSave = content.trim().length > 0 && date.length > 0;

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-900/45 backdrop-blur-sm"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="diary-modal-title"
        className="w-full sm:max-w-xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 bg-[#faf8f4] border border-stone-200 shadow-2xl animate-fade-in"
      >
        <div className="flex items-center justify-between mb-7">
          <div>
            <h2
              id="diary-modal-title"
              className="text-xl font-bold text-stone-800"
            >
              今日もがんばったね
            </h2>

            <p className="text-xs text-stone-400 mt-1">
              書けるだけ書けばいい
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="モーダルを閉じる"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#f2efe9] text-stone-400 hover:bg-stone-200 transition-colors active:scale-95"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="diary-date"
              className="block text-[11px] text-stone-400 font-mono tracking-widest mb-2"
            >
              DATE
            </label>

            <input
              id="diary-date"
              name="date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
              className="block w-full px-4 py-3 rounded-2xl text-sm text-stone-700 font-mono bg-[#f2efe9] border border-stone-200 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100 transition"
            />
          </div>

          <fieldset className="mb-6">
            <legend className="text-[11px] text-stone-400 font-mono tracking-widest mb-2">
              MOOD
            </legend>

            <div className="flex flex-wrap gap-2">
              {moodOptions.map((option) => {
                const isSelected = mood === option.value;

                return (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() => setMood(option.value)}
                    aria-label={option.label}
                    aria-pressed={isSelected}
                    className={`w-11 h-11 rounded-xl text-xl flex items-center justify-center border-2 transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-purple-50 border-purple-300 scale-105 shadow-sm'
                        : 'bg-[#f2efe9] border-transparent hover:bg-stone-100'
                    }`}
                  >
                    {option.emoji}
                  </button>
                );
              })}
            </div>
          </fieldset>

       

          <div className="mb-6">
            <label htmlFor="diary-content" className="sr-only">
              日記本文
            </label>

            <textarea
              ref={textareaRef}
              id="diary-content"
              name="content"
              rows={5}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="今日もなんとか生きた。それだけでいい。"
              className="block w-full px-4 py-3 rounded-2xl text-sm leading-relaxed text-stone-700 placeholder:text-stone-400 bg-[#f2efe9] border border-stone-200 outline-none resize-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100 transition"
            />
          </div>

          <button
            type="submit"
            disabled={!canSave}
            className={`w-full py-4 px-6 rounded-2xl text-base font-bold transition-all ${
              canSave
                ? 'bg-gradient-to-r from-purple-300 via-purple-200 to-pink-200 text-stone-700 shadow-md hover:opacity-95 active:scale-[0.98]'
                : 'bg-[#e0d8cc] text-stone-400 cursor-not-allowed'
            }`}
          >
            {canSave ? '記録する　✓' : '何か書いてから…'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DiaryModal;