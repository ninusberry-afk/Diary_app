interface MyPageProps {
  nickname: string;
  email: string;
  onBack: () => void;
  onEditName: () => void;
  onEditEmail: () => void;
  onEditPassword: () => void;
  onLogout: () => void | Promise<void>;
  onDeleteAccount: () => void;
}

const MyPage = ({
  nickname,
  email,
  onBack,
  onEditName,
  onEditEmail,
  onEditPassword,
  onLogout,
  onDeleteAccount,
}: MyPageProps) => {
  return (
    <div className="w-full mt-2 animate-fade-in">
      {/* タイトル */}
      <div className="flex items-center gap-3 mb-5">
        <button
          type="button"
          onClick={onBack}
          aria-label="TOPページへ戻る"
          className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-[#f2efe9] text-purple-400 border border-stone-200 hover:bg-stone-100 transition-colors active:scale-95"
        >
          ‹
        </button>

        <div>
          <h2 className="text-lg font-bold text-stone-800 leading-tight">
            マイページ
          </h2>

          <p className="text-xs text-stone-400 mt-0.5">
            登録情報の確認と変更
          </p>
        </div>
      </div>

      {/* プロフィールカード */}
      <section className="w-full bg-white/90 backdrop-blur-sm rounded-3xl border border-stone-200 shadow-lg overflow-hidden">
        {/* ユーザー情報 */}
        <div className="flex items-center gap-4 px-5 py-6 border-b border-stone-100">
          <div
            className="w-14 h-14 shrink-0 flex items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 border border-purple-200 text-2xl"
            aria-hidden="true"
          >
            😪
          </div>

          <div className="min-w-0">
            <p className="text-base font-bold text-stone-800 break-words">
              {nickname}
            </p>

            <p className="text-xs text-stone-400 mt-1 break-all">
              {email}
            </p>
          </div>
        </div>

        {/* 名前 */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-stone-100">
          <div className="w-[72px] shrink-0">
            <p className="text-[10px] font-mono tracking-wider text-stone-400">
              NAME
            </p>
          </div>

          <p className="flex-1 min-w-0 text-sm text-stone-700 break-words">
            {nickname}
          </p>

          <button
            type="button"
            onClick={onEditName}
            className="shrink-0 px-3 py-1.5 bg-[#f2efe9] text-stone-500 text-xs font-bold rounded-lg border border-stone-200 hover:bg-stone-100 transition-colors active:scale-95"
          >
            編集
          </button>
        </div>

        {/* メールアドレス */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-stone-100">
          <div className="w-[72px] shrink-0">
            <p className="text-[10px] font-mono tracking-wider text-stone-400">
              EMAIL
            </p>
          </div>

          <p className="flex-1 min-w-0 text-xs text-stone-700 truncate">
            {email}
          </p>

          <button
            type="button"
            onClick={onEditEmail}
            className="shrink-0 px-3 py-1.5 bg-[#f2efe9] text-stone-500 text-xs font-bold rounded-lg border border-stone-200 hover:bg-stone-100 transition-colors active:scale-95"
          >
            編集
          </button>
        </div>

        {/* パスワード */}
        <div className="flex items-center gap-3 px-5 py-4">
          <div className="w-[72px] shrink-0">
            <p className="text-[10px] font-mono tracking-wider text-stone-400">
              PASSWORD
            </p>
          </div>

          <p className="flex-1 min-w-0 text-sm font-mono text-stone-700">
            ••••••••
          </p>

          <button
            type="button"
            onClick={onEditPassword}
            className="shrink-0 px-3 py-1.5 bg-[#f2efe9] text-stone-500 text-xs font-bold rounded-lg border border-stone-200 hover:bg-stone-100 transition-colors active:scale-95"
          >
            編集
          </button>
        </div>
      </section>

      {/* ログアウト */}
      <button
        type="button"
        onClick={() => void onLogout()}
        className="w-full mt-5 py-3.5 px-6 bg-[#f2efe9] border border-stone-300 text-stone-500 font-bold rounded-2xl hover:bg-stone-100 transition-all active:scale-[0.98]"
      >
        ログアウト
      </button>

      {/* 登録削除 */}
      <div className="flex justify-end pt-4 pb-3">
        <button
          type="button"
          onClick={onDeleteAccount}
          className="text-xs text-rose-300 hover:text-rose-400 underline underline-offset-2 transition-colors"
        >
          登録を削除する
        </button>
      </div>
    </div>
  );
};

export default MyPage;