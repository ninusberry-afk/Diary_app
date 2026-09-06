import { useEffect, useState } from 'react';
import Login from './Login';
import MyPage from './MyPage';
import ProfileFieldEdit from './components/my-page/ProfileFieldEdit';
import PasswordEdit from './components/my-page/PasswordEdit';
import DeleteAccount from './components/DeleteAccount';
import Calendar from './components/Calendar';
import NoteIcon from './assets/note_icon.svg';
import DiaryModal from './components/DiaryModal';
import EditModal from './components/EditModal';
import UpdatePassword from './components/UpdatePassword';
import {AllEntriesView,DetailView,} from './components/DiaryViews';
import { supabase } from './lib/supabase';

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

type CurrentPage =
  | 'home'
  | 'myPage'
  | 'editName'
  | 'editEmail'
  | 'editPassword'
  | 'deleteAccount';

// --- 感情アイコン ---
const moodEmojis: Record<MoodType, string> = {
  happy: '😊',
  tired: '😴',
  sad: '😢',
  angry: '😠',
  neutral: '😑',
};

// --- 当日の日付 ---
const getTodayDateString = () => {
  const today = new Date();

  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-');
};

export function App() {


  
  // --- アプリ全体 ---
  const [isLoggedIn, setIsLoggedIn] =
    useState<boolean>(false); // ログインの状態

  // パスワード再設定画面を表示するか
  const [isPasswordRecovery, setIsPasswordRecovery] =
    useState<boolean>(false);

  // Supabaseのログイン状態を確認中かどうか
  const [isAuthLoading, setIsAuthLoading] =
    useState<boolean>(true);

  // 新規登録・ログイン時の名前
  const [nickname, setNickname] =
    useState<string>('ゲスト');

  // ログイン中のメールアドレス
  const [email, setEmail] =
    useState<string>('');

  // 現在表示している画面
  const [currentPage, setCurrentPage] =
    useState<CurrentPage>('home');

  // モーダル開閉
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

  // Supabaseから取得する日記データ
  const [diaryList, setDiaryList] =
    useState<DiaryEntry[]>([]);

  // 日記データを取得中かどうか
  const [isDiaryLoading, setIsDiaryLoading] =
    useState<boolean>(false);

    // --- ページ読み込み時にログイン状態を復元 ---
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (sessionError) {
        console.error(
          'セッション取得エラー:',
          sessionError,
        );

        setIsLoggedIn(false);
        setIsAuthLoading(false);
        return;
      }

      // 保存済みのログイン情報がない場合
      if (!session) {
        setIsLoggedIn(false);
        setIsAuthLoading(false);
        return;
      }

      // ログイン中のユーザーのニックネームを取得
      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from('users')
        .select('name')
        .eq('id', session.user.id)
        .single();

      if (!isMounted) {
        return;
      }

      if (profileError) {
        console.error(
          'ユーザー情報復元エラー:',
          profileError,
        );

        setIsLoggedIn(false);
        setIsAuthLoading(false);
        return;
      }

      setNickname(profile.name);
      setEmail(session.user.email ?? '');
      setCurrentPage('home');
      setIsLoggedIn(true);
      setIsAuthLoading(false);
    };

    // Supabaseの認証状態の変化を確認
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // パスワードリセットメールのリンクから戻った場合
        if (event === 'PASSWORD_RECOVERY') {
          setIsPasswordRecovery(true);
          setIsLoggedIn(false);
          setIsAuthLoading(false);
          return;
        }

        // ログインしたユーザーのメールアドレスを保存
        if (
          (event === 'SIGNED_IN' ||
            event === 'USER_UPDATED') &&
          session
        ) {
          setEmail(session.user.email ?? '');
        }

        // ログアウトした場合
        if (event === 'SIGNED_OUT') {
          setIsPasswordRecovery(false);
          setIsLoggedIn(false);
          setIsAuthLoading(false);
        }
      },
    );

    restoreSession();

    return () => {
      isMounted = false;

      // 認証状態の監視を解除
      subscription.unsubscribe();
    };
  }, []);

  // --- ログイン中のユーザーの日記を取得 ---
  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    let isMounted = true;

    const fetchDiaries = async () => {
      setIsDiaryLoading(true);

      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          diary_date,
          mood,
          content,
          created_at
        `)
        .order('diary_date', {
          ascending: false,
        })
        .order('created_at', {
          ascending: false,
        });

      if (!isMounted) {
        return;
      }

      if (error) {
        console.error(
          '日記取得エラー:',
          error,
        );

        setDiaryList([]);
        setIsDiaryLoading(false);
        return;
      }

      // DBのカラム名をReact側の型へ変換
      const formattedDiaries: DiaryEntry[] =
        (data ?? []).map((post) => ({
          id: post.id,
          date: post.diary_date,
          mood: post.mood as MoodType,
          content: post.content,
          createdAt: post.created_at,
        }));

      setDiaryList(formattedDiaries);
      setIsDiaryLoading(false);
    };

    fetchDiaries();

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn]);

  // 表示するのは最大5件まで
  const displayedDiaries =
    diaryList.slice(0, 5);

  const todayDate = getTodayDateString();

  // --- ログイン処理 ---
  const handleLogin = (
    loggedInNickname: string,
  ) => {
    // public.usersから取得したニックネームを設定
    setNickname(loggedInNickname);
    setCurrentPage('home');
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

    // ニックネームを保存
    setNickname(trimmedNickname);
    setCurrentPage('home');
    setIsLoggedIn(true);
  };

  // --- マイページを開く ---
  const handleOpenMyPage = () => {
    // 開いている日記関連の画面を閉じる
    setShowDiaryModal(false);
    setSelectedDate(null);
    setEditingEntry(null);
    setShowAllEntries(false);
    setReturnToAllEntries(false);

    setCurrentPage('myPage');
  };

  // --- マイページからTOPへ戻る ---
  const handleMyPageBack = () => {
    setCurrentPage('home');
  };

  // --- 名前変更処理 ---
  const handleUpdateName = async (
    newName: string,
  ): Promise<void> => {
    const trimmedName = newName.trim();

    if (!trimmedName) {
      throw new Error(
        '名前が入力されていません。',
      );
    }

    // 現在ログイン中のユーザーを取得
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error(
        'ユーザー取得エラー:',
        userError,
      );

      throw (
        userError ??
        new Error(
          'ログインユーザーを取得できませんでした。',
        )
      );
    }

    // public.usersの名前を更新
    const {
      data,
      error: updateError,
    } = await supabase
      .from('users')
      .update({
        name: trimmedName,
      })
      .eq('id', user.id)
      .select('name')
      .single();

    if (updateError) {
      console.error(
        '名前変更エラー:',
        updateError,
      );

      throw updateError;
    }

    // 画面上の名前も更新
    setNickname(data.name);
  };

  // --- メールアドレス変更処理 ---
  const handleUpdateEmail = async (
    newEmail: string,
  ): Promise<void> => {
    const trimmedEmail = newEmail.trim();

    const isEmailValid =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        trimmedEmail,
      );

    if (!isEmailValid) {
      throw new Error(
        'メールアドレスの形式が正しくありません。',
      );
    }

    if (trimmedEmail === email) {
      throw new Error(
        '現在と同じメールアドレスです。',
      );
    }

    const { error } =
      await supabase.auth.updateUser({
        email: trimmedEmail,
      });

    if (error) {
      console.error(
        'メールアドレス変更エラー:',
        error,
      );

      throw error;
    }

    alert(
      '確認メールを送信しました。メール内のリンクを開くと変更が完了します。',
    );
  };

    const handleChangePassword = async (
      currentPassword: string,
      newPassword: string,
    ): Promise<void> => {
      if (!email) {
        throw new Error('ログイン中のメールアドレスを取得できません。');
      }

      // 現在のパスワードが正しいか確認
      const { error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password: currentPassword,
        });

      if (signInError) {
        console.error('現在のパスワード確認エラー:', signInError);
        throw new Error('現在のパスワードが正しくありません。');
      }

      // 新しいパスワードに更新
      const { error: updateError } =
        await supabase.auth.updateUser({
          password: newPassword,
        });

      if (updateError) {
        console.error('パスワード変更エラー:', updateError);
        throw updateError;
      }

      alert('パスワードを変更しました。');
    };

    // --- アカウント削除 ---
    const handleDeleteAccount = async (): Promise<void> => {
      const { data, error } =
        await supabase.functions.invoke('delete-account');

      if (error) {
        console.error('アカウント削除エラー:', error);
        throw error;
      }

      if (!data?.success) {
        console.error('アカウント削除失敗:', data);
        throw new Error(
          data?.error ?? 'アカウントを削除できませんでした。',
        );
      }

      // このブラウザに残っているログイン情報を削除
      const { error: signOutError } =
        await supabase.auth.signOut({
          scope: 'local',
        });

      if (signOutError) {
        console.error(
          'アカウント削除後のログアウトエラー:',
          signOutError,
        );
      }

      setDiaryList([]);
      setNickname('ゲスト');
      setEmail('');
      setCurrentPage('home');
      setIsLoggedIn(false);

      alert('登録を削除しました。');
    };

  // --- ログアウト ---
  const handleLogout = async () => {
    const { error } =
      await supabase.auth.signOut();

    if (error) {
      console.error(
        'ログアウトエラー:',
        error,
      );

      return;
    }

    // Supabaseからログアウトできた後、アプリ内の表示状態を初期化する
    setIsLoggedIn(false);
    setIsPasswordRecovery(false);
    setNickname('ゲスト');
    setEmail('');
    setCurrentPage('home');
    setDiaryList([]);
    setShowDiaryModal(false);
    setSelectedDate(null);
    setEditingEntry(null);
    setShowAllEntries(false);
    setReturnToAllEntries(false);
  };

  // --- パスワード再設定処理 ---
  const handleUpdatePassword = async (
    newPassword: string,
  ): Promise<void> => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error(
        'パスワード更新エラー:',
        error,
      );

      throw error;
    }

    // 更新後はいったんログアウトしてログイン画面へ戻す
    const { error: signOutError } =
      await supabase.auth.signOut();

    if (signOutError) {
      console.error(
        'パスワード更新後のログアウトエラー:',
        signOutError,
      );
    }

    setIsPasswordRecovery(false);
    setIsLoggedIn(false);
    setNickname('ゲスト');
  };

  // --- 日記保存 ---
  const handleSaveDiary = async (
    entry: DiaryEntry,
  ) => {
    const { data, error } = await supabase
      .from('posts')
      .insert({
        diary_date: entry.date,
        mood: entry.mood,
        content: entry.content,
      })
      .select(`
        id,
        diary_date,
        mood,
        content,
        created_at
      `)
      .single();

    if (error) {
      console.error(
        '日記登録エラー:',
        error,
      );

      alert(
        '日記を登録できませんでした。もう一度お試しください。',
      );

      return;
    }

    // DBのカラム名をReact側の型へ変換
    const savedDiary: DiaryEntry = {
      id: data.id,
      date: data.diary_date,
      mood: data.mood as MoodType,
      content: data.content,
      createdAt: data.created_at,
    };

    // 登録した日記を画面の一覧へ追加
    setDiaryList((currentDiaryList) => [
      savedDiary,
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
    // タイムラインから開いたため、詳細画面から戻るとトップページへ戻す
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

  // --- 日記編集 ---
  const handleEditDiary = async (
    updatedEntry: DiaryEntry,
  ) => {
    const { data, error } = await supabase
      .from('posts')
      .update({
        mood: updatedEntry.mood,
        content: updatedEntry.content,
      })
      .eq('id', updatedEntry.id)
      .select(`
        id,
        diary_date,
        mood,
        content,
        created_at
      `)
      .single();

    if (error) {
      console.error(
        '日記編集エラー:',
        error,
      );

      alert(
        '日記を編集できませんでした。もう一度お試しください。',
      );

      return;
    }

    // DBのカラム名をReact側の型へ変換
    const savedDiary: DiaryEntry = {
      id: data.id,
      date: data.diary_date,
      mood: data.mood as MoodType,
      content: data.content,
      createdAt: data.created_at,
    };

    // 編集済みの日記に置き換える
    setDiaryList((currentDiaryList) =>
      currentDiaryList.map((entry) =>
        entry.id === savedDiary.id
          ? savedDiary
          : entry,
      ),
    );
  };

// --- 日記削除 ---
const handleDeleteDiary = async (
  id: string,
  ) => {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(
        '日記削除エラー:',
        error,
      );

      alert(
        '日記を削除できませんでした。もう一度お試しください。',
      );

      return;
    }

    // DBから削除できた後、画面の一覧からも削除
    setDiaryList((currentDiaryList) =>
      currentDiaryList.filter(
        (entry) => entry.id !== id,
      ),
    );

    // 削除した日記の詳細画面を閉じる
    setSelectedDate(null);
    setEditingEntry(null);
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#f6f4ed] flex items-center justify-center">
        <p className="text-sm text-stone-400">
          読み込み中…
        </p>
      </div>
    );
  }

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

          {/* マイページボタン */}
          {isLoggedIn && currentPage === 'home' && (
            <button
              type="button"
              onClick={handleOpenMyPage}
              className="shrink-0 px-3 sm:px-4 py-1.5 bg-gradient-to-r from-purple-300 to-pink-200 hover:opacity-95 text-stone-700 text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95"
            >
              マイページ
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
        {/* --- パスワード再設定・ログイン・TOP画面の切り替え --- */}
        {isPasswordRecovery ? (
          <UpdatePassword
            onUpdatePassword={handleUpdatePassword}
          />
        ) : !isLoggedIn ? (
          <Login
            onLogin={handleLogin}
            onRegister={handleRegister}
          />
        ) : currentPage === 'deleteAccount' ? (
         <DeleteAccount
            onBack={() => {
              setCurrentPage('myPage');
            }}
            onDelete={handleDeleteAccount}
          />
        ) : currentPage === 'editPassword' ? (
            <PasswordEdit
              onBack={() => {
                setCurrentPage('myPage');
              }}
              onSave={handleChangePassword}
            />

        ) : currentPage === 'editEmail' ? (
          <ProfileFieldEdit
            field="email"
            initialValue={email}
            onBack={() => {
              setCurrentPage('myPage');
            }}
            onSave={handleUpdateEmail}
          />
        ) : currentPage === 'editName' ? (
          <ProfileFieldEdit
            field="name"
            initialValue={nickname}
            onBack={() => {
              setCurrentPage('myPage');
            }}
            onSave={handleUpdateName}
          />
        ) : currentPage === 'myPage' ? (
          <MyPage
            nickname={nickname}
            email={email}
            onBack={handleMyPageBack}
            onEditName={() => {
              setCurrentPage('editName');
            }}
            onEditEmail={() => {
              setCurrentPage('editEmail');
            }}
            onEditPassword={() => {
              setCurrentPage('editPassword');
            }}
            onLogout={handleLogout}
            onDeleteAccount={() => {
              setCurrentPage('deleteAccount');
            }}
          />
        ) : (
          /* --- TOPページ画面 --- */
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

              {isDiaryLoading && (
                <div className="bg-white/80 rounded-2xl p-4 border border-stone-100 text-center">
                  <p className="text-xs text-stone-400">
                    日記を読み込んでいます…
                  </p>
                </div>
              )}

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

              {/* すべての日記を見る */}
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

      {/* 日記一覧 */}
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

      {/* カレンダーで選択後の詳細画面 */}
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