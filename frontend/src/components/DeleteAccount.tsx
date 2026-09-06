import { useState } from 'react';

interface DeleteAccountProps {
  onBack: () => void;
  onDelete: () => void | Promise<void>;
}

const DeleteAccount = ({
  onBack,
  onDelete,
}: DeleteAccountProps) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleDelete = async () => {
    if (isDeleting) {
      return;
    }

    setErrorMessage('');
    setIsDeleting(true);

    try {
      await onDelete();

      setIsDeleting(false);
      setShowConfirm(false);
    } catch {
      setErrorMessage(
        '登録を削除できませんでした。もう一度お試しください。',
      );
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="w-full bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-stone-200 shadow-lg mt-10 animate-fade-in">
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
            登録削除
          </h2>

          <p className="text-xs text-stone-400 mt-0.5">
            アカウントと日記を削除します
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-[#f5eded] border border-pink-200 p-5 text-center mb-5">
        <div className="text-4xl mb-3" aria-hidden="true">
          🗑️
        </div>

        <p className="text-sm font-bold text-stone-700 mb-2">
          登録ごと日記を削除しますか？
        </p>

        <p className="text-xs text-stone-500 leading-6">
          アカウントと、これまでに登録した
          <br />
          すべての日記が削除されます。
          <br />
          この操作は元に戻せません。
        </p>
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
        type="button"
        onClick={() => setShowConfirm(true)}
        className="w-full py-4 px-6 bg-[#c97070] hover:opacity-95 text-white font-bold rounded-2xl shadow-sm transition-all active:scale-[0.98]"
      >
        登録を削除する
      </button>

      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-800/40 backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowConfirm(false);
            }
          }}
        >
          <div className="w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-xl">
            <div className="text-center mb-5">
              <div
                className="text-3xl mb-3"
                aria-hidden="true"
              >
                ⚠️
              </div>

              <h3 className="text-base font-bold text-stone-800 mb-2">
                本当に削除しますか？
              </h3>

              <p className="text-xs text-stone-500 leading-6">
                登録を削除すると元に戻せません。
                <br />
                よろしいですか？
              </p>
            </div>

            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full py-3.5 mb-2 bg-[#c97070] text-white font-bold rounded-2xl transition-all active:scale-95 disabled:opacity-60"
            >
              {isDeleting
                ? '削除しています…'
                : '登録を削除する'}
            </button>

            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              disabled={isDeleting}
              className="w-full py-3 bg-[#f2efe9] border border-stone-200 text-stone-500 font-bold rounded-2xl transition-all active:scale-95"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteAccount;