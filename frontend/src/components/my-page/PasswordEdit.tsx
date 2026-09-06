import {
  useState,
  type FormEvent,
} from 'react';

interface PasswordEditProps {
  onBack: () => void;

  onSave: (
    currentPassword: string,
    newPassword: string,
  ) => void | Promise<void>;
}

const PasswordEdit = ({
  onBack,
  onSave,
}: PasswordEditProps) => {
  const [
    currentPassword,
    setCurrentPassword,
  ] = useState<string>('');

  const [
    newPassword,
    setNewPassword,
  ] = useState<string>('');

  const [
    passwordConfirm,
    setPasswordConfirm,
  ] = useState<string>('');

  const [isSubmitting, setIsSubmitting] =
    useState<boolean>(false);

  const [errorMessage, setErrorMessage] =
    useState<string>('');

  const isMismatch =
    passwordConfirm.length > 0 &&
    newPassword !== passwordConfirm;

  const isSamePassword =
    currentPassword.length > 0 &&
    newPassword.length > 0 &&
    currentPassword === newPassword;

  const isFormValid =
    currentPassword.length >= 8 &&
    newPassword.length >= 8 &&
    newPassword === passwordConfirm &&
    currentPassword !== newPassword;

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
      await onSave(
        currentPassword,
        newPassword,
      );

      onBack();
    } catch {
      setErrorMessage(
        'パスワードを変更できませんでした。現在のパスワードをご確認ください。',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-stone-200 shadow-lg mt-10 animate-fade-in">
      {/* タイトル */}
      <div className="flex items-center gap-3 mb-7">
        <button
          type="button"
          onClick={onBack}
          aria-label="マイページへ戻る"
          className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-[#f2efe9] text-purple-400 border border-stone-200 hover:bg-stone-100 transition-colors active:scale-95"
        >
          ‹
        </button>

        <div>
          <h2 className="text-lg font-bold text-stone-800 leading-tight">
            パスワードを変更
          </h2>

          <p className="text-xs text-stone-400 mt-0.5">
            新しいパスワードを設定してください
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
      >
        {/* 現在のパスワード */}
        <div className="mb-5">
          <label
            htmlFor="current-password"
            className="block text-sm font-medium text-stone-400 mb-2"
          >
            現在のパスワード
          </label>

          <input
            id="current-password"
            name="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(event) =>
              setCurrentPassword(
                event.target.value,
              )
            }
            placeholder="8文字以上"
            autoComplete="current-password"
            minLength={8}
            required
            className="w-full px-5 py-4 bg-[#f3f0eb] border border-stone-200 rounded-2xl text-sm text-stone-700 placeholder:text-stone-400 focus:border-purple-300 focus:ring-2 focus:ring-purple-100 outline-none transition"
          />
        </div>

        {/* 新しいパスワード */}
        <div className="mb-5">
          <label
            htmlFor="new-password"
            className="block text-sm font-medium text-stone-400 mb-2"
          >
            新しいパスワード
          </label>

          <input
            id="new-password"
            name="newPassword"
            type="password"
            value={newPassword}
            onChange={(event) =>
              setNewPassword(
                event.target.value,
              )
            }
            placeholder="8文字以上"
            autoComplete="new-password"
            minLength={8}
            required
            className="w-full px-5 py-4 bg-[#f3f0eb] border border-stone-200 rounded-2xl text-sm text-stone-700 placeholder:text-stone-400 focus:border-purple-300 focus:ring-2 focus:ring-purple-100 outline-none transition"
          />

          {newPassword.length > 0 &&
            newPassword.length < 8 && (
              <p className="text-xs text-pink-500 mt-2 ml-1">
                8文字以上で入力してください。
              </p>
            )}

          {isSamePassword && (
            <p className="text-xs text-pink-500 mt-2 ml-1">
              現在とは違うパスワードを入力してください。
            </p>
          )}
        </div>

        {/* 新しいパスワード（確認） */}
        <div className="mb-5">
          <label
            htmlFor="password-confirm"
            className="block text-sm font-medium text-stone-400 mb-2"
          >
            新しいパスワード（確認）
          </label>

          <input
            id="password-confirm"
            name="passwordConfirm"
            type="password"
            value={passwordConfirm}
            onChange={(event) =>
              setPasswordConfirm(
                event.target.value,
              )
            }
            placeholder="もう一度入力してください"
            autoComplete="new-password"
            minLength={8}
            required
            className={`w-full px-5 py-4 bg-[#f3f0eb] border rounded-2xl text-sm text-stone-700 placeholder:text-stone-400 focus:ring-2 outline-none transition ${
              isMismatch
                ? 'border-pink-300 focus:ring-pink-100'
                : 'border-stone-200 focus:border-purple-300 focus:ring-purple-100'
            }`}
          />

          {isMismatch && (
            <p className="text-xs text-pink-500 mt-2 ml-1">
              新しいパスワードが一致しません。
            </p>
          )}
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
          disabled={
            !isFormValid || isSubmitting
          }
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

export default PasswordEdit;