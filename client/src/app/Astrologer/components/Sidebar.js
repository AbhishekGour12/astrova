"use client";
import { FaComments } from "react-icons/fa";

export default function Sidebar() {
  return (
    <div className="w-64 bg-[#003D33] text-white flex flex-col">

      {/* LOGO */}
      <div className="p-5 text-xl font-bold border-b border-white/20">
        Astrologer Panel
      </div>

      {/* MENU */}
      <div className="flex-1 p-4 space-y-2">
        <div className="flex items-center gap-3 px-3 py-2 rounded bg-[#00695C] cursor-pointer">
          <FaComments />
          <span>Chats</span>
        </div>

        {/* Future items */}
        {/* Earnings */}
        {/* Profile */}
        {/* Availability */}
      </div>

    </div>
  );
}
