import { useState, type FormEvent } from 'react';

interface PwResetProps {
  onReset: (email: string,) => void | Promise<void>;

  onGoLogin: () => void;
}

const PwReset = ({ onReset, onGoLogin }: PwResetProps) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isFormValid = email.trim().length > 0;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isFormValid || isSubmitting) {
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await onReset(email.trim());
      setIsDone(true);
    } catch {
      setErrorMessage(
        'パスワードをリセットできませんでした。もう一度お試しください。',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isDone) {
    return (
      <div className="w-full bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-stone-200 shadow-lg mt-10 animate-fade-in">
        <div className="text-center py-4">
          <div className="text-5xl mb-4" aria-hidden="true">
            ✉️
          </div>

          <h2 className="text-lg font-bold text-stone-800 mb-2">
            完了しました
          </h2>

          <p className="text-sm text-stone-500 leading-7 mb-6">
            パスワード再設定用のメールを送信しました。
            <br />
            メール内のリンクを開いてください。
          </p>

          <button
            type="button"
            onClick={onGoLogin}
            className="w-full py-3 px-6 bg-gradient-to-r from-purple-300 via-purple-200 to-pink-200 hover:opacity-95 text-stone-700 font-bold rounded-2xl shadow-md transition-all active:scale-[0.98]"
          >
            ログイン画面へ戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-stone-200 shadow-lg mt-10 animate-fade-in">
      <div className="flex items-center gap-3 mb-7">
        <button
          type="button"
          onClick={onGoLogin}
          aria-label="ログイン画面へ戻る"
          className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-[#f2efe9] text-purple-400 border border-stone-200 hover:bg-stone-100 transition-colors active:scale-95"
        >
          ‹
        </button>

        <div>
          <h2 className="text-lg font-bold text-stone-800 leading-tight">
            パスワードリセット
          </h2>

          <p className="text-xs text-stone-400 mt-0.5">
            忘れても大丈夫、人間だもの
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-5">
          <label
            htmlFor="reset-email"
            className="block text-sm font-medium text-stone-400 mb-2"
          >
            登録済みメールアドレス
          </label>

          <input
            id="reset-email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="genkai@example.com"
            autoComplete="email"
            required
            className="w-full px-5 py-4 bg-[#f3f0eb] border border-stone-200 rounded-2xl text-sm text-stone-700 placeholder:text-stone-400 focus:border-purple-300 focus:ring-2 focus:ring-purple-100 outline-none transition"
          />
        </div>

        {errorMessage && (
          <p
            role="alert"
            className="text-xs text-pink-500 text-center mb-4"
          >
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className={`w-full py-4 px-6 font-bold rounded-2xl transition-all ${
            isFormValid && !isSubmitting
              ? 'bg-gradient-to-r from-purple-300 via-purple-200 to-pink-200 text-stone-700 shadow-md hover:opacity-95 active:scale-[0.98]'
              : 'bg-[#dfd8cd] text-stone-400 cursor-not-allowed'
          }`}
        >
          {isSubmitting
            ? 'リセットしています…'
            : 'パスワードをリセットする'}
        </button>
      </form>
    </div>
  );
};

export default PwReset;