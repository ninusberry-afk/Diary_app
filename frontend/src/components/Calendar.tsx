import { useState } from 'react';

type MoodType =
  | 'happy'
  | 'tired'
  | 'sad'
  | 'angry'
  | 'neutral';

interface CalendarDiary {
  date: string;
  mood: MoodType;
}

interface CalendarProps {
  diaryList: CalendarDiary[];
  moodEmojis: Record<MoodType, string>;

  // 日記詳細ページ実装後に使用できる
  onDateSelect?: (date: string) => void;
}

const weekdays = [
  { name: '日', color: 'text-pink-400' },
  { name: '月', color: 'text-stone-400' },
  { name: '火', color: 'text-stone-400' },
  { name: '水', color: 'text-stone-400' },
  { name: '木', color: 'text-stone-400' },
  { name: '金', color: 'text-stone-400' },
  { name: '土', color: 'text-sky-400' },
];

const Calendar = ({
  diaryList,
  moodEmojis,
  onDateSelect,
}: CalendarProps) => {
  
const today = new Date();

const [currentYear, setCurrentYear] =
  useState(today.getFullYear());

const [currentMonth, setCurrentMonth] =
  useState(today.getMonth() + 1);

const [selectedDate, setSelectedDate] =
  useState(
    `${today.getFullYear()}-${String(
      today.getMonth() + 1,
    ).padStart(2, '0')}-${String(
      today.getDate(),
    ).padStart(2, '0')}`,
  );

  // 前の月へ移動
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear((year) => year - 1);
      setCurrentMonth(12);
      return;
    }

    setCurrentMonth((month) => month - 1);
  };

  // 次の月へ移動
  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear((year) => year + 1);
      setCurrentMonth(1);
      return;
    }

    setCurrentMonth((month) => month + 1);
  };

  // 日付をYYYY-MM-DD形式にする
  const createDateString = (day: number) => {
    return [
      currentYear,
      String(currentMonth).padStart(2, '0'),
      String(day).padStart(2, '0'),
    ].join('-');
  };

  // 日付クリック時
  const handleDateClick = (day: number) => {
    const dateString = createDateString(day);

    setSelectedDate(dateString);

    // 日記詳細ページ実装後に処理を渡せる
    onDateSelect?.(dateString);
  };

  // 月初の曜日
  const firstDayOfWeek = new Date(
    currentYear,
    currentMonth - 1,
    1,
  ).getDay();

  // 表示中の月の日数
  const daysInMonthCount = new Date(
    currentYear,
    currentMonth,
    0,
  ).getDate();

  // 月初までの空白
  const emptyDays = Array.from({
    length: firstDayOfWeek,
  });

  // 1日から月末までの日付
  const daysInMonth = Array.from(
    { length: daysInMonthCount },
    (_, index) => index + 1,
  );

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-5 border border-stone-100 shadow-sm">
      {/* 年月と月移動ボタン */}
      <div className="flex items-center justify-between mb-6 px-2">
        <button
          type="button"
          onClick={handlePrevMonth}
          aria-label="前の月へ"
          className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100 transition-colors active:scale-95"
        >
          ‹
        </button>

        <h2 className="text-lg font-bold text-stone-700 tracking-wide">
          {currentYear}年 {currentMonth}月
        </h2>

        <button
          type="button"
          onClick={handleNextMonth}
          aria-label="次の月へ"
          className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100 transition-colors active:scale-95"
        >
          ›
        </button>
      </div>

      {/* 曜日 */}
      <div className="grid grid-cols-7 text-center text-xs font-medium mb-3">
        {weekdays.map((weekday) => (
          <div
            key={weekday.name}
            className={weekday.color}
          >
            {weekday.name}
          </div>
        ))}
      </div>

      {/* 日付グリッド */}
      <div className="grid grid-cols-7 text-center gap-y-1">
        {/* 月初までの空白 */}
        {emptyDays.map((_, index) => (
          <div
            key={`empty-${index}`}
            className="h-14"
          />
        ))}

        {daysInMonth.map((day, index) => {
          const dayOfWeek =
            (index + firstDayOfWeek) % 7;

          const dateString =
            createDateString(day);

          const isSelected =
            selectedDate === dateString;

          // 該当する日の日記を取得
          const diary = diaryList.find(
            (entry) => entry.date === dateString,
          );

          // 日記の感情アイコンを取得
          const moodEmoji = diary
            ? moodEmojis[diary.mood]
            : null;

          let dateTextColor = 'text-stone-700';

          if (dayOfWeek === 0) {
            dateTextColor = 'text-pink-400';
          }

          if (dayOfWeek === 6) {
            dateTextColor = 'text-sky-400';
          }

          return (
            <button
              type="button"
              key={dateString}
              onClick={() => handleDateClick(day)}
              aria-label={
                moodEmoji
                  ? `${dateString}の日記、感情${moodEmoji}`
                  : dateString
              }
              className="relative h-14 flex items-center justify-center focus:outline-none active:scale-95 transition-transform"
            >
              <span
                className={`
                  w-11 h-13 py-1
                  flex flex-col items-center justify-center
                  rounded-2xl text-sm transition-all
                  ${dateTextColor}
                  ${
                    isSelected
                      ? 'bg-purple-50 border-2 border-dashed border-purple-300 font-bold shadow-xs'
                      : 'hover:bg-stone-50'
                  }
                `}
              >
                {/* 日付 */}
                <span className="leading-none">
                  {day}
                </span>

                {/* 日記がある日の感情アイコン */}
                {moodEmoji && (
                  <span
                    className="text-lg leading-none mt-1"
                    aria-hidden="true"
                  >
                    {moodEmoji}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* 説明文 */}
      <div className="mt-5 pt-4 border-t border-stone-100">
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-stone-400">
            日付をタップすると詳細を確認できます
          </p>

          <span
            className="text-base animate-bounce"
            aria-hidden="true"
          >
            👆
          </span>
        </div>
      </div>
    </div>
  );
};



export default Calendar;