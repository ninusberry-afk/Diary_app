import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-[#F9F7F7]">
      {/* 左側：アイコンとテキスト */}
      <div className="flex items-center gap-3">
        {/* アイコン部分*/}
        <div className="w-8 h-8 rounded-md bg-white border border-gray-100 flex items-center justify-center overflow-hidden shadow-sm">
          <span>
            <img src={"/aseets.note_icon.svg"} alt="日記アイコン" className="w-full h-full object-cover" />
          </span>
          
        </div>

        <div className="flex flex-col leading-tight">
          <h1 className="text-lg font-bold text-gray-800 tracking-wide">
            限界ダイアリー
          </h1>
          <span className="text-[10px] text-gray-400 font-mono tracking-wider uppercase">
            I'm done.
          </span>
        </div>
      </div>

      {/* ログインボタン */}
      <Link  to="/login" className="btn btn-sm rounded-full bg-[#E6E0F8] text-[#6A5ACD] hover:bg-[#D4C9F5] hover:text-[#5544B0] border-none shadow-sm px-4">
        Login
      </Link>
    </header>
  );
};

export default Header;


