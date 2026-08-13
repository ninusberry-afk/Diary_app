


import { useEffect, useState } from 'react';

type MoodType = 'happy' | 'tired' | 'sad' | 'angry' | 'neutral';

export interface DiaryViewEntry {
  id: string;
  date: string;
  mood: MoodType;
  content: string;
  createdAt: string;
}

interface SharedViewProps {
  entries: DiaryViewEntry[];
  moodEmojis: Record<MoodType, string>;
}

const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

const formatDateJa = (dateString: string) => {
  const [year, month, day] = dateString.split('-').map(Number);
  const dayOfWeek = new Date(year, month - 1, day).getDay();

  return {
    dayOfWeek,
    label: `${year}年${month}月${day}日（${weekdays[dayOfWeek]}）`,
  };
};

interface DetailViewProps extends SharedViewProps {
  date: string;
  today: string;
  onBack: () => void;
  onAddEntry: (date: string) => void;
  onEdit: (entry: DiaryViewEntry) => void;
}

export function DetailView({
  date,
  today,
  entries,
  moodEmojis,
  onBack,
  onAddEntry,
  onEdit,
}: DetailViewProps) {
  const { label, dayOfWeek } = formatDateJa(date);
  const dayEntries = entries.filter((entry) => entry.date === date);
  const isToday = date === today;
  const isFuture = date > today;

  const headingColor =
    dayOfWeek === 0
      ? 'text-pink-400'
      : dayOfWeek === 6
        ? 'text-sky-400'
        : 'text-stone-800';

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#f2efe9] animate-fade-in">
      <header className="flex items-center gap-3 px-4 sm:px-5 py-4 shrink-0 bg-[#f2efe9]/90 backdrop-blur-xl border-b border-stone-200">
        <button
          type="button"
          onClick={onBack}
          aria-label="トップページへ戻る"
          className="w-9 h-9 flex items-center justify-center rounded-2xl shrink-0 bg-white border border-stone-200 text-purple-500 active:scale-95"
        >
          ‹
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-stone-400 font-mono tracking-wider">
            DIARY DETAIL
          </p>
          <h2 className={`font-bold text-base leading-tight truncate ${headingColor}`}>
            {label}
          </h2>
        </div>

        {isToday && (
          <span className="px-2.5 py-1 rounded-full shrink-0 bg-purple-50 text-purple-500 text-[10px] font-mono">
            TODAY
          </span>
        )}
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 py-6 space-y-4">
          <section className="rounded-3xl p-5 sm:p-6 flex items-center gap-4 sm:gap-5 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shrink-0 bg-white shadow-sm text-3xl">
              {dayEntries.length > 0
                ? moodEmojis[dayEntries[0].mood]
                : isFuture
                  ? '🔮'
                  : '🌙'}
            </div>

            <div className="min-w-0">
              <p className="text-[10px] text-stone-400 font-mono tracking-wider">
                {date}
              </p>
              <p className="font-bold text-base sm:text-lg text-stone-800 mt-0.5">
                {dayEntries.length > 0
                  ? `${dayEntries.length}件のきろく`
                  : isFuture
                    ? 'まだ来ていない日'
                    : '記録なし'}
              </p>

            </div>
          </section>

          {dayEntries.length === 0 ? (
            <section className="rounded-3xl p-10 text-center bg-white border border-dashed border-stone-200">
              <div className="text-5xl mb-4" aria-hidden="true">
                {isFuture ? '🔮' : '🌙'}
              </div>
              <p className="font-bold text-sm text-stone-400">
                {isFuture ? 'まだ書けないよ' : 'この日の記録はまだない'}
              </p>
              <p className="text-xs text-stone-300 mt-1.5">
                {isFuture ? 'その日が来たら書こう' : '生きてただけで十分だよ'}
              </p>
            </section>
          ) : (
            <div className="space-y-3">
              {dayEntries.map((entry) => (
                <article
                  key={entry.id}
                  className="rounded-3xl overflow-hidden bg-white border border-stone-200"
                >
                  <div className="px-4 sm:px-5 pt-5 pb-4 border-b border-stone-100">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 bg-purple-50">
                        {moodEmojis[entry.mood]}
                      </div>

                      <div className="flex-1 min-w-0" />

                      <button
                        type="button"
                        onClick={() => onEdit(entry)}
                        className="shrink-0 px-2.5 py-1 rounded-xl bg-[#f2efe9] border border-stone-200 text-stone-400 text-[11px] font-mono active:scale-95"
                      >
                        編集
                      </button>
                    </div>
                  </div>

                  <div className="px-4 sm:px-5 py-4">
                    <p className="text-sm text-stone-600 leading-7 whitespace-pre-wrap break-words">
                      {entry.content}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}

          {!isFuture && (
            <button
              type="button"
              onClick={() => onAddEntry(date)}
              className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 bg-white border-2 border-dashed border-purple-200 text-purple-400 font-bold text-sm active:scale-[0.98]"
            >
              <span aria-hidden="true">✏️</span>
              {dayEntries.length > 0 ? 'もう一件追加する' : 'この日の記録を書く'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface AllEntriesViewProps extends SharedViewProps {
  today: string;
  onBack: () => void;
  onSelectDate: (date: string) => void;
}

export function AllEntriesView({
  entries,
  moodEmojis,
  today,
  onBack,
  onSelectDate,
}: AllEntriesViewProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 右側から一覧画面を表示する
    const animationFrame = requestAnimationFrame(() => {
      setVisible(true);
    });

    return () =>
      cancelAnimationFrame(animationFrame);
  }, []);

  // 一覧画面からトップページへ戻る
  const handleBack = () => {
    setVisible(false);

    window.setTimeout(() => {
      onBack();
    }, 280);
  };

  // 選択した日付の詳細画面へ移動する
  const handleSelectDate = (date: string) => {
    setVisible(false);

    window.setTimeout(() => {
      onSelectDate(date);
    }, 280);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{
        backgroundColor: '#f2efe9',
        transform: visible
          ? 'translateX(0)'
          : 'translateX(100%)',
        transition:
          'transform 0.28s cubic-bezier(0.32, 0, 0.15, 1)',
      }}
    >
      {/* 全件一覧ヘッダー */}
      <header
        className="flex items-center gap-3 px-3 sm:px-5 py-4 shrink-0"
        style={{
          backgroundColor:
            'rgba(242, 239, 233, 0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #e0d8cc',
        }}
      >
        <button
          type="button"
          onClick={handleBack}
          aria-label="トップページへ戻る"
          className="w-9 h-9 flex items-center justify-center rounded-2xl shrink-0 active:scale-95"
          style={{
            border: '1px solid #e0d8cc',
            color: '#7c5cbf',
            backgroundColor: '#ffffff',
          }}
        >
          ‹
        </button>

        <div className="flex-1 min-w-0">
          <p
            style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: '0.6rem',
              color: '#a89e94',
              letterSpacing: '0.06em',
            }}
          >
            ALL ENTRIES
          </p>

          <h2
            style={{
              fontFamily:
                'Zen Maru Gothic, sans-serif',
              fontWeight: 700,
              fontSize: '1rem',
              color: '#3a3035',
              lineHeight: 1.2,
            }}
          >
            全ての日記
          </h2>
        </div>

        <span
          className="px-2.5 py-1 rounded-full shrink-0"
          style={{
            backgroundColor: '#ede8f8',
            color: '#7c5cbf',
            fontSize: '0.65rem',
            fontFamily: 'DM Mono, monospace',
          }}
        >
          {entries.length} 件
        </span>
      </header>

      {/* 日記全件一覧 */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 py-6 space-y-3">
          {entries.length === 0 ? (
            // 日記が1件もない場合
            <div
              className="rounded-3xl p-10 text-center"
              style={{
                backgroundColor: '#ffffff',
                border: '1px dashed #e0d8cc',
              }}
            >
              <div
                className="text-5xl mb-4"
                aria-hidden="true"
              >
                🌙
              </div>

              <p
                style={{
                  fontFamily:
                    'Zen Maru Gothic, sans-serif',
                  color: '#a89e94',
                  fontSize: '0.95rem',
                }}
              >
                まだ記録がないよ
              </p>
            </div>
          ) : (
            entries.map((entry, index) => (
              <button
                type="button"
                key={entry.id}
                onClick={() =>
                  handleSelectDate(entry.date)
                }
                className="relative w-full rounded-3xl p-4 sm:p-5 text-left transition-all hover:shadow-md active:scale-[0.99]"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e0d8cc',
                }}
              >
                {/* カード同士をつなぐ縦線 */}
                {index < entries.length - 1 && (
                  <div
                    className="absolute left-[26px] -bottom-3 w-px h-3"
                    style={{
                      backgroundColor: '#e0d8cc',
                    }}
                  />
                )}

                <div className="flex items-start gap-3">
                  {/* 感情アイコン */}
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0"
                    style={{
                      backgroundColor: '#f5f0fb',
                    }}
                  >
                    {moodEmojis[entry.mood]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        style={{
                          fontFamily:
                            'DM Mono, monospace',
                          fontSize: '0.65rem',
                          color: '#a89e94',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {entry.date}
                      </span>

                      {entry.date === today && (
                        <span
                          className="px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor:
                              '#ede8f8',
                            color: '#7c5cbf',
                            fontSize: '0.65rem',
                            fontFamily:
                              'DM Mono, monospace',
                          }}
                        >
                          TODAY
                        </span>
                      )}
                    </div>

                    {/* 日記本文 */}
                    <p
                      className="line-clamp-3"
                      style={{
                        fontSize: '0.82rem',
                        color: '#6e6068',
                        lineHeight: 1.7,
                      }}
                    >
                      {entry.content}
                    </p>
                  </div>

                  <span
                    className="shrink-0 mt-0.5"
                    style={{
                      color: '#d4c8f0',
                      fontSize: '1rem',
                    }}
                  >
                    ›
                  </span>
                </div>
              </button>
            ))
          )}

          <div className="h-8" />
        </div>
      </div>
    </div>
  );
}

