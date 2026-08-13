import {
  useState,
  type FormEvent,
} from 'react';

interface UpdatePasswordProps {
  onUpdatePassword: (
    newPassword: string,
  ) => Promise<void>;
}

const UpdatePassword = ({
  onUpdatePassword,
}: UpdatePasswordProps) => {
  const [password, setPassword] =
    useState<string>('');

  const [passwordConfirm, setPasswordConfirm] =
    useState<string>('');

  const [isSubmitting, setIsSubmitting] =
    useState<boolean>(false);

  const [errorMessage, setErrorMessage] =
    useState<string>('');

  const isMismatch =
    passwordConfirm.length > 0 &&
    password !== passwordConfirm;

  const isFormValid =
    password.length >= 8 &&
    password === passwordConfirm;

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!isFormValid || isSubmitting) {
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await onUpdatePassword(password);
    } catch {
      setErrorMessage(
        'パスワードを変更できませんでした。もう一度お試しください。',
      );

      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-lg mt-10 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-stone-800">
          新しいパスワード
        </h2>

        <p className="text-sm text-stone-500 mt-1">
          新しく使用するパスワードを入力してください
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div>
          <label
            htmlFor="update-password"
            className="block text-sm font-bold text-stone-600 mb-1.5 ml-1"
          >
            新しいパスワード
          </label>

          <input
            id="update-password"
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            placeholder="8文字以上"
            autoComplete="new-password"
            minLength={8}
            required
            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:border-purple-300 focus:ring-2 focus:ring-purple-100 outline-none transition"
          />

          {password.length > 0 &&
            password.length < 8 && (
              <p className="text-xs text-pink-400 mt-2 ml-1">
                8文字以上で入力してください。
              </p>
            )}
        </div>

        <div>
          <label
            htmlFor="update-password-confirm"
            className="block text-sm font-bold text-stone-600 mb-1.5 ml-1"
          >
            新しいパスワード（確認）
          </label>

          <input
            id="update-password-confirm"
            type="password"
            value={passwordConfirm}
            onChange={(event) =>
              setPasswordConfirm(
                event.target.value,
              )
            }
            placeholder="••••••••"
            autoComplete="new-password"
            required
            className={`w-full px-4 py-3 bg-stone-50 border rounded-2xl text-sm focus:ring-2 outline-none transition ${
              isMismatch
                ? 'border-pink-300 focus:ring-pink-100'
                : 'border-stone-200 focus:border-purple-300 focus:ring-purple-100'
            }`}
          />

          {isMismatch && (
            <p className="text-xs text-pink-400 mt-2 ml-1">
              パスワードが一致しません。
            </p>
          )}
        </div>

        {errorMessage && (
          <p
            role="alert"
            className="text-xs text-pink-500 text-center"
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
            ? '変更しています…'
            : 'パスワードを変更する'}
        </button>
      </form>
    </div>
  );
};

export default UpdatePassword;