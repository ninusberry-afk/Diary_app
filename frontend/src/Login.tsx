import {
  useState,
  type FormEvent,
} from 'react';

import PwReset from './components/PwReset';
import { supabase } from './lib/supabase';

interface LoginProps {
  onLogin: (nickname: string) => void;
  onRegister: (nickname: string) => void;
}

export function Login({
  onLogin,
  onRegister,
}: LoginProps) {
  // ログイン画面と新規登録画面の切り替え
  const [showRegister, setShowRegister] =
    useState<boolean>(false);

  // パスワードリセット画面の表示
  const [showPwReset, setShowPwReset] =
    useState<boolean>(false);

  // 認証処理中かどうか
  const [isSubmitting, setIsSubmitting] =
    useState<boolean>(false);

  // 新規登録・ログインのエラー
  const [authError, setAuthError] =
    useState<string>('');

  // 新規登録完了後のお知らせ
  const [authMessage, setAuthMessage] =
    useState<string>('');

  // ログイン用の入力値
  const [loginEmail, setLoginEmail] =
    useState<string>('');

  const [loginPassword, setLoginPassword] =
    useState<string>('');

  // 新規登録用の入力値
  const [registerNickname, setRegisterNickname] =
    useState<string>('');

  const [registerEmail, setRegisterEmail] =
    useState<string>('');

  const [registerPassword, setRegisterPassword] =
    useState<string>('');

  const [
    registerPasswordConfirm,
    setRegisterPasswordConfirm,
  ] = useState<string>('');

  // パスワードが一致の確認
  const passwordMismatch =
    registerPasswordConfirm.length > 0 &&
    registerPassword !== registerPasswordConfirm;

  // 新規登録できる状態か
  const canRegister =
    registerNickname.trim().length > 0 &&
    registerEmail.trim().length > 0 &&
    registerPassword.length >= 8 &&
    registerPasswordConfirm.length > 0 &&
    !passwordMismatch;

  // ログイン処理
  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const trimmedEmail =
      loginEmail.trim();

    if (!trimmedEmail || !loginPassword) {
      return;
    }

    setIsSubmitting(true);
    setAuthError('');
    setAuthMessage('');

    // メールアドレスとパスワードでログイン
    const {
      data: loginData,
      error: loginError,
    } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password: loginPassword,
    });

    if (loginError) {
      console.error(
        'ログインエラー:',
        loginError,
      );

      setIsSubmitting(false);
      setAuthError(
        'メールアドレスまたはパスワードが正しくありません。',
      );

      return;
    }

    // ログインしたユーザーのニックネームを取得
    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from('users')
      .select('name')
      .eq('id', loginData.user.id)
      .single();

    if (profileError) {
      console.error(
        'ユーザー情報取得エラー:',
        profileError,
      );

      // プロフィールを取得できなかった場合は
      // 中途半端なログイン状態を残さない
      await supabase.auth.signOut();

      setIsSubmitting(false);
      setAuthError(
        'ユーザー情報を取得できませんでした。',
      );

      return;
    }

    setIsSubmitting(false);

    // App.tsxへニックネームを渡す
    onLogin(profile.name);
  };

  // 新規登録処理
  const handleRegisterSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!canRegister || isSubmitting) {
      return;
    }

  const trimmedNickname =
    registerNickname.trim();

  const trimmedEmail =
    registerEmail.trim();

  setIsSubmitting(true);
  setAuthError('');
  setAuthMessage('');

  const { data, error } =
    await supabase.auth.signUp({
      email: trimmedEmail,
      password: registerPassword,
      options: {
        // public.usersへ保存するため、
        // auth.usersのメタデータへ名前を渡す
        data: {
          name: trimmedNickname,
        },
      },
    });

  setIsSubmitting(false);

  if (error) {
    console.error(
      '新規登録エラー:',
      error,
    );

    setAuthError(
      '新規登録に失敗しました。入力内容を確認してください。',
    );

    return;
  }

  // メール確認が無効の場合は、
  // 登録直後にセッションが作成される
  if (data.session) {
    onRegister(trimmedNickname);
    return;
  }

  // メール確認が有効の場合
  setAuthMessage(
    '確認メールを送信しました。メール内のリンクを開いてからログインしてください。',
  );

  setShowRegister(false);
};

  const handlePasswordReset = async (
    email: string,
  ): Promise<void> => {
    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: window.location.origin,
        },
      );

    if (error) {
      console.error(
        'パスワードリセットメール送信エラー:',
        error,
      );

      throw error;
    }
  };

  // パスワードリセット画面
  if (showPwReset) {
    return (
      <PwReset
        onReset={handlePasswordReset}
        onGoLogin={() =>
          setShowPwReset(false)
        }
      />
    );
  }

  // 新規登録画面
  if (showRegister) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-stone-100 shadow-lg mt-10 animate-fade-in">
        {/* 新規登録画面のヘッダー */}
        <div className="flex items-center gap-3 mb-7">
          <button
            type="button"
            onClick={() =>
              setShowRegister(false)
            }
            aria-label="ログイン画面へ戻る"
            className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-[#f2efe9] text-purple-500 border border-stone-200 transition-all active:scale-95"
          >
            ‹
          </button>

          <div>
            <h2 className="text-xl font-bold text-stone-800 leading-tight">
              新規登録
            </h2>

            <p className="text-xs text-stone-400 mt-1">
              はじめまして、限界の仲間よ
            </p>
          </div>
        </div>

        <form
          onSubmit={handleRegisterSubmit}
          className="space-y-5"
        >
          {/* ニックネーム入力 */}
          <div>
            <label
              htmlFor="register-nickname"
              className="block text-sm font-bold text-stone-600 mb-1.5 ml-1"
            >
              なまえ
            </label>

            <input
              id="register-nickname"
              name="nickname"
              type="text"
              value={registerNickname}
              onChange={(event) =>
                setRegisterNickname(
                  event.target.value,
                )
              }
              placeholder="ニックネーム"
              autoComplete="nickname"
              required
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:border-purple-300 focus:ring-purple-200 focus:ring-1 outline-none transition"
            />
          </div>

          {/* メールアドレス入力 */}
          <div>
            <label
              htmlFor="register-email"
              className="block text-sm font-bold text-stone-600 mb-1.5 ml-1"
            >
              メールアドレス
            </label>

            <input
              id="register-email"
              name="email"
              type="email"
              value={registerEmail}
              onChange={(event) =>
                setRegisterEmail(
                  event.target.value,
                )
              }
              placeholder="genkai@example.com"
              autoComplete="email"
              required
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:border-purple-300 focus:ring-purple-200 focus:ring-1 outline-none transition"
            />
          </div>

          {/* パスワード入力 */}
          <div>
            <label
              htmlFor="register-password"
              className="block text-sm font-bold text-stone-600 mb-1.5 ml-1"
            >
              パスワード
            </label>

            <input
              id="register-password"
              name="password"
              type="password"
              value={registerPassword}
              onChange={(event) =>
                setRegisterPassword(
                  event.target.value,
                )
              }
              placeholder="8文字以上"
              autoComplete="new-password"
              minLength={8}
              required
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:border-purple-300 focus:ring-purple-200 focus:ring-1 outline-none transition"
            />
          </div>

          {/* パスワード確認入力 */}
          <div>
            <label
              htmlFor="register-password-confirm"
              className="block text-sm font-bold text-stone-600 mb-1.5 ml-1"
            >
              パスワード（確認）
            </label>

            <input
              id="register-password-confirm"
              name="passwordConfirm"
              type="password"
              value={registerPasswordConfirm}
              onChange={(event) =>
                setRegisterPasswordConfirm(
                  event.target.value,
                )
              }
              placeholder="••••••••"
              autoComplete="new-password"
              minLength={8}
              required
              aria-invalid={passwordMismatch}
              className={`w-full px-4 py-2.5 bg-stone-50 border rounded-2xl text-sm outline-none transition ${
                passwordMismatch
                  ? 'border-pink-300 focus:ring-pink-100'
                  : 'border-stone-200 focus:border-purple-300 focus:ring-purple-200'
              } focus:ring-1`}
            />

            {passwordMismatch && (
              <p className="text-xs text-pink-400 mt-1.5 ml-1">
                パスワードが一致しません
              </p>
            )}
          </div>

          {authError && (
            <p
              role="alert"
              className="text-xs text-pink-500 text-center"
            >
              {authError}
            </p>
          )}

          {/* アカウント作成ボタン */}
          <button
            type="submit"
            disabled={!canRegister || isSubmitting}
            className={`w-full py-3 px-6 font-bold rounded-2xl transition-all ${
              canRegister && !isSubmitting
                ? 'bg-gradient-to-r from-purple-300 via-purple-200 to-pink-200 text-stone-700 shadow-md hover:opacity-95 active:scale-[0.98]'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
          {isSubmitting
            ? '登録しています…'
            : 'アカウントを作成する'}
          </button>

        </form>

        <p className="text-center mt-5 text-xs text-stone-400">
          すでにアカウントがある方は{' '}
          <button
            type="button"
            onClick={() =>
              setShowRegister(false)
            }
            className="text-purple-400 hover:text-purple-500 underline underline-offset-2"
          >
            ログイン
          </button>
        </p>
      </div>
    );
  }

  // ログイン画面
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-stone-100 shadow-lg mt-10 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-stone-800">
          ログイン
        </h2>

        <p className="text-sm text-stone-500 mt-1">
          おつかれさま まってたよ
        </p>
        {authMessage && (
          <p
            role="status"
            className="mt-4 px-4 py-3 rounded-2xl bg-purple-50 text-xs text-purple-500 leading-relaxed"
          >
            {authMessage}
          </p>
)}
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div>
          <label
            htmlFor="login-email"
            className="block text-sm font-bold text-stone-600 mb-1.5 ml-1"
          >
            メールアドレス
          </label>

          <input
            id="login-email"
            name="email"
            type="email"
            value={loginEmail}
            onChange={(event) =>
              setLoginEmail(event.target.value)
            }
            placeholder="name@email.com"
            autoComplete="email"
            required
            className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:border-purple-300 focus:ring-purple-200 focus:ring-1 outline-none transition"
          />
        </div>

        <div>
          <label
            htmlFor="login-password"
            className="block text-sm font-bold text-stone-600 mb-1.5 ml-1"
          >
            パスワード
          </label>

          <input
            id="login-password"
            name="password"
            type="password"
            value={loginPassword}
            onChange={(event) =>
              setLoginPassword(event.target.value)
            }
            placeholder="••••••••"
            autoComplete="current-password"
            required
            className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:border-purple-300 focus:ring-purple-200 focus:ring-1 outline-none transition"
          />
        </div>
        
        {authError && (
          <p
            role="alert"
            className="text-xs text-pink-500 text-center"
          >
            {authError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 px-6 mt-4 font-bold rounded-2xl transition-all ${
            isSubmitting
              ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-300 via-purple-200 to-pink-200 hover:opacity-95 text-stone-700 shadow-md active:scale-[0.98]'
          }`}
        >
          {isSubmitting
            ? 'ログインしています…'
            : 'ログインする'}
        </button>

        <button
          type="button"
          onClick={() =>
            setShowRegister(true)
          }
          className="w-full py-3 px-6 border border-purple-200 bg-white hover:bg-purple-50 text-stone-700 font-bold rounded-2xl transition-all active:scale-[0.98]"
        >
          新規登録
        </button>
      </form>

      <div className="text-center mt-5">
        <button
          type="button"
          onClick={() =>
            setShowPwReset(true)
          }
          className="text-xs text-stone-400 hover:text-purple-400 underline underline-offset-2 transition-colors"
        >
          パスワードがわからない方
        </button>
      </div>
    </div>
  );
}

export default Login;