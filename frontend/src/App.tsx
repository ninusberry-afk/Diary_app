import { useState } from 'react';
import Login from './Login';
import Calendar from './components/Calendar';
import NoteIcon from './assets/note_icon.svg';
import DiaryModal from './components/DiaryModal'
import EditModal from './components/EditModal';
import {AllEntriesView,DetailView,} from './components/DiaryViews';

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

export interface User {
  email: string;
  name: string;
  isLoggedIn: boolean;
}

// --- 感情アイコンの定義 ---
const moodEmojis: Record<MoodType, string> = {
  happy: '😊',
  tired: '😴',
  sad: '😢',
  angry: '😠',
  neutral: '😑',
};

// --- 当日の日付をYYYY-MM-DD形式で取得 ---
const getTodayDateString = () => {
  const today = new Date();

  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-');
};

export function App() {
  // --- 1. アプリ全体の共通状態（State） ---
  const [isLoggedIn, setIsLoggedIn] =
    useState<boolean>(false); // ログイン状態（初期値：未ログイン）

  // 新規登録・ログイン機能の完成後は、ログインしたユーザーのニックネームを設定する
  const [nickname, setNickname] =
    useState<string>('ゲスト');

  // モーダル開閉用
  const [showDiaryModal, setShowDiaryModal] =
    useState<boolean>(false);

  // カレンダーで選択した日付
  const [selectedDate, setSelectedDate] =
    useState<string | null>(null);

  // 日記全件一覧画面の表示状態
  const [showAllEntries, setShowAllEntries] =
    useState<boolean>(false);

  // 詳細画面から全件一覧へ戻るかどうか
  const [returnToAllEntries, setReturnToAllEntries] =
    useState<boolean>(false);

// 編集する日記
  const [editingEntry, setEditingEntry] =
    useState<DiaryEntry | null>(null);  

  // ダミーの日記データ（5件以上）
  const [diaryList, setDiaryList] =
    useState<DiaryEntry[]>([
      {
        id: '1',
        date: '2026-07-22',
        mood: 'tired',
        content:
          'アラームを4回止めた。起きたら昼だった。まあ、生きてる。それでいい。',
        createdAt: '2026-07-22 14:00',
      },
      {
        id: '2',
        date: '2026-07-21',
        mood: 'neutral',
        content:
          '温かいお茶を飲んでぼーっとした。何も進まなかったけど平和。',
        createdAt: '2026-07-21 16:30',
      },
      {
        id: '3',
        date: '2026-07-20',
        mood: 'happy',
        content:
          '自炊する気力が湧かずピザを頼んだ。美味しかったのでオールOK。',
        createdAt: '2026-07-20 19:15',
      },
      {
        id: '4',
        date: '2026-07-19',
        mood: 'neutral',
        content:
          'コンビニまで歩いた。風が気持ちよかった。',
        createdAt: '2026-07-19 11:00',
      },
      {
        id: '5',
        date: '2026-07-18',
        mood: 'sad',
        content:
          'ずっと布団の中にいた。こんな日があってもいいよね。',
        createdAt: '2026-07-18 22:00',
      },
      {
        id: '6',
        date: '2026-07-17',
        mood: 'angry',
        content:
          '気づいたら深夜2時。たまには羽目を外すのも大事。',
        createdAt: '2026-07-17 02:30',
      },
    ]);

  // 表示するのは最大5件まで
  const displayedDiaries =
    diaryList.slice(0, 5);

  const todayDate = getTodayDateString();

  // テスト用ログイン処理
  const handleLogin = () => {
    // 実際のログイン機能では、
    // APIから取得したニックネームを設定する
    setNickname('ゲスト');
    setIsLoggedIn(true);
  };

  // --- 新規登録処理 ---
  const handleRegister = (
    registeredNickname: string,
  ) => {
    const trimmedNickname =
      registeredNickname.trim();

    if (!trimmedNickname) {
      return;
    }

    // 新規登録画面で入力されたニックネームを保存
    setNickname(trimmedNickname);

    // 登録後はログイン済みとしてトップページを表示
    setIsLoggedIn(true);
  };

  // --- ログアウト処理 ---
  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowDiaryModal(false);
    setSelectedDate(null);
    setEditingEntry(null);
    setShowAllEntries(false);
    setReturnToAllEntries(false);
  };

  // --- 日記保存処理 ---
  const handleSaveDiary = (
    entry: DiaryEntry,
  ) => {
    // 新しく登録した日記を一覧の先頭へ追加
    setDiaryList((currentDiaryList) => [
      entry,
      ...currentDiaryList,
    ]);
  };

  // --- カレンダーの日付クリック処理 ---
  const handleCalendarDateSelect = (date: string,) => {
    // カレンダーから開いたため、 戻るときはトップページへ戻す
    setReturnToAllEntries(false);
    setSelectedDate(date);
  };

  // --- タイムラインの日記クリック処理 ---
  const handleTimelineEntrySelect = (
    date: string,
  ) => {
    // タイムラインから開いたため、
    // 詳細画面から戻るとトップページへ戻す
    setReturnToAllEntries(false);

    // 全件一覧画面は閉じておく
    setShowAllEntries(false);

    // 選択した日記の日付を詳細画面へ渡す
    setSelectedDate(date);
  };

  // --- 全件一覧から日記詳細を開く ---
  const handleAllEntrySelect = (
    date: string,
  ) => {
    // 一覧画面を閉じる
    setShowAllEntries(false);

    // 詳細から戻るときは全件一覧へ戻す
    setReturnToAllEntries(true);

    // 選択した日付の詳細を開く
    setSelectedDate(date);
  };

  // --- 日記詳細画面から戻る ---
  const handleDetailBack = () => {
    setSelectedDate(null);

    if (returnToAllEntries) {
      setShowAllEntries(true);
      setReturnToAllEntries(false);
    }
  };

  // --- 日記編集処理 ---
const handleEditDiary = (
  updatedEntry: DiaryEntry,
) => {
  setDiaryList((currentDiaryList) =>
    currentDiaryList.map((entry) =>
      entry.id === updatedEntry.id
        ? updatedEntry
        : entry,
    ),
  );
};

// --- 日記削除処理 ---
const handleDeleteDiary = (id: string) => {
  setDiaryList((currentDiaryList) =>
    currentDiaryList.filter(
      (entry) => entry.id !== id,
    ),
  );
};

  return (
    <div className="min-h-screen bg-[#f6f4ed] text-stone-800 font-sans selection:bg-purple-100 pb-12">
      {/* ヘッダーエリア */}
      <header className="w-full bg-[#f6f4ed] border-b border-stone-200/60 px-3 sm:px-4 py-3 sticky top-0 z-40">
            <div
              className={`w-full mx-auto flex items-center justify-between gap-2 ${
                isLoggedIn
                  ? 'max-w-md md:max-w-2xl'
                  : 'max-w-md'
              }`}
            >         
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-10 h-10 shrink-0 rounded-lg bg-stone-200 flex items-center justify-center text-xl shadow-sm">
              <img
                src={NoteIcon}
                alt="日記アイコン"
                className="w-7 h-7"
              />
            </div>

            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-stone-800 leading-tight whitespace-nowrap">
                限界ダイアリー
              </h1>

              <p className="text-[8px] sm:text-[10px] text-stone-400 font-mono whitespace-nowrap">
                GENKAI DIARY — for the exhausted
              </p>
            </div>
          </div>

          {/* ログイン/ログアウトボタン */}
          {isLoggedIn && (
            <button
              type="button"
              onClick={handleLogout}
              className="shrink-0 px-3 sm:px-4 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
            >
              Logout
            </button>
          )}
        </div>
      </header>

      {/* メイン */}
      <main className={`w-full mx-auto px-3 sm:px-4 py-4 space-y-6 ${
          isLoggedIn
            ? 'max-w-md md:max-w-2xl'
            : 'max-w-md'
        }`}
      >
        {/* ---  ログイン画面 --- */}
        {!isLoggedIn ? (
          <Login
            onLogin={handleLogin}
            onRegister={handleRegister}
          />
        ) : (
          /* --- 🔵 元のTOPページ画面 --- */
          <>
            {/* ログイン時メッセージ */}
            {isLoggedIn && (
              <div className="bg-white/80 rounded-2xl p-4 border border-stone-100 shadow-sm text-center">
                <p className="text-sm font-bold text-stone-700">
                  おつかれさま {nickname} さん
                </p>
              </div>
            )}

            {/* カレンダー */}
            <Calendar
              diaryList={diaryList}
              moodEmojis={moodEmojis}
              onDateSelect={handleCalendarDateSelect}
            />
            {/* 日記登録ボタン */}
            <button
              type="button" onClick={() => setShowDiaryModal(true)}
              className="w-full py-4 px-4 sm:px-6 bg-gradient-to-r from-purple-300 via-purple-200 to-pink-200 hover:opacity-95 text-white font-bold rounded-2xl shadow-sm flex flex-col items-center justify-center transition-all active:scale-[0.98]"
            >
              <span className="text-base text-stone-700 font-bold flex items-center gap-2">
                📝 なにか書く？
              </span>

              <span className="text-[9px] sm:text-[10px] text-stone-500 font-mono tracking-wider">
                tap to record today&apos;s survival
              </span>
            </button>

            {/* タイムライン（最大5件） */}
            <section className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <h2 className="font-bold text-stone-700 text-sm">
                  さいきんのきろく
                </h2>

                <span className="text-[10px] font-mono text-stone-400">
                  最新 {displayedDiaries.length} 件
                </span>
              </div>

              {/* 5件分ループ表示 */}
              {displayedDiaries.map((diary) => (
                <button
                  type="button"
                  key={diary.id}
                  onClick={() =>
                    handleTimelineEntrySelect(diary.date)
                  }
                  aria-label={`${diary.date}の日記詳細を開く`}
                  className="w-full text-left bg-white/80 rounded-2xl p-3 sm:p-4 border border-stone-100 shadow-sm flex gap-3 animate-fade-in transition-all hover:bg-white hover:shadow-md active:scale-[0.99]"
                >
                  <div
                    className="text-2xl shrink-0"
                    aria-hidden="true"
                  >
                    {moodEmojis[diary.mood]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-mono text-stone-400">
                      {diary.date}
                    </div>

                    <p className="text-xs text-stone-500 leading-relaxed break-words mt-1">
                      {diary.content}
                    </p>
                  </div>

                  {/* 日記詳細へ進めることを示す矢印 */}
                  <span
                    className="shrink-0 self-center text-purple-200"
                    aria-hidden="true"
                  >
                    ›
                  </span>
                </button>
              ))}

              {/* 右下の「日記をすべて見る」リンク（元のグレー系） */}
              {diaryList.length > 5 && (
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDate(null);
                      setReturnToAllEntries(false);
                      setShowAllEntries(true);
                    }}
                    className="text-xs text-stone-400 hover:text-purple-400 underline underline-offset-2 transition-colors font-medium"
                  >
                    すべての日記を見る ›
                  </button>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* 日記全件一覧画面 */}
      {showAllEntries && (
        <AllEntriesView
          entries={diaryList}
          moodEmojis={moodEmojis}
          today={todayDate}
          onBack={() =>
            setShowAllEntries(false)
          }
          onSelectDate={handleAllEntrySelect}
        />
      )}

      {/* カレンダーで選択した日付の詳細画面 */}
      {selectedDate && (
        <DetailView
          date={selectedDate}
          today={todayDate}
          entries={diaryList}
          moodEmojis={moodEmojis}
          onBack={handleDetailBack}          
          onAddEntry={() => setShowDiaryModal(true)}
          onEdit={setEditingEntry}
        />
      )}

      {/* 日記登録モーダル */}
      {showDiaryModal && (
        <DiaryModal
          defaultDate={selectedDate ?? undefined}
          onClose={() =>
            setShowDiaryModal(false)
          }
          onSave={handleSaveDiary}
        />
      )}

      {/* 日記編集モーダル */}
      {editingEntry && (
        <EditModal
          entry={editingEntry}
          onClose={() =>
            setEditingEntry(null)
          }
          onSave={handleEditDiary}
          onDelete={handleDeleteDiary}
        />
      )}
      
    </div>
  );
}

export default App;