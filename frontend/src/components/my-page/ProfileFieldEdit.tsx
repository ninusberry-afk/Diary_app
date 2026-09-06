import {
  useState,
  type FormEvent,
} from 'react';

type ProfileField = 'name' | 'email';

interface ProfileFieldEditProps {
  field: ProfileField;
  initialValue: string;
  onBack: () => void;
  onSave: (
    value: string,
  ) => void | Promise<void>;
}

const ProfileFieldEdit = ({
  field,
  initialValue,
  onBack,
  onSave,
}: ProfileFieldEditProps) => {
  const [value, setValue] =
    useState<string>(initialValue);

  const [isSubmitting, setIsSubmitting] =
    useState<boolean>(false);

  const [errorMessage, setErrorMessage] =
    useState<string>('');

  const trimmedValue = value.trim();

  const isEmailValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      trimmedValue,
    );

  const isFormValid =
    field === 'name'
      ? trimmedValue.length > 0
      : isEmailValid;

  const screenInfo =
    field === 'name'
      ? {
          title: '名前を編集',
          description:
            'あなたらしい名前でどうぞ',
          label: '名前',
          type: 'text',
          placeholder: '限界太郎',
          autoComplete: 'name',
        }
      : {
          title: 'メールアドレスを編集',
          description:
            '新しいメールアドレスを入力してください',
          label: 'メールアドレス',
          type: 'email',
          placeholder: 'genkai@example.com',
          autoComplete: 'email',
        };

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
      await onSave(trimmedValue);
      onBack();
    } catch {
      setErrorMessage(
        field === 'name'
          ? '名前を変更できませんでした。もう一度お試しください。'
          : 'メールアドレスを変更できませんでした。もう一度お試しください。',
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
            {screenInfo.title}
          </h2>

          <p className="text-xs text-stone-400 mt-0.5">
            {screenInfo.description}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="mb-5">
          <label
            htmlFor={`profile-${field}`}
            className="block text-sm font-medium text-stone-400 mb-2"
          >
            {screenInfo.label}
          </label>

          <input
            id={`profile-${field}`}
            name={field}
            type={screenInfo.type}
            value={value}
            onChange={(event) =>
              setValue(event.target.value)
            }
            placeholder={screenInfo.placeholder}
            autoComplete={screenInfo.autoComplete}
            required
            className="w-full px-5 py-4 bg-[#f3f0eb] border border-stone-200 rounded-2xl text-sm text-stone-700 placeholder:text-stone-400 focus:border-purple-300 focus:ring-2 focus:ring-purple-100 outline-none transition"
          />
        </div>

        {field === 'email' &&
          trimmedValue.length > 0 &&
          !isEmailValid && (
            <p className="text-xs text-pink-500 text-center mb-4">
              正しいメールアドレスを入力してください。
            </p>
          )}

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
            ? '保存しています…'
            : '変更を保存する'}
        </button>
      </form>
    </div>
  );
};

export default ProfileFieldEdit;