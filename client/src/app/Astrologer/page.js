"use client";
import Sidebar from "./components/Sidebar";
import ChatPanel from "./components/ChatPannel";

export default function AstrologerDashboard() {
  return (
    <div className="flex h-screen bg-[#F7F3E9]">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-hidden">
        <ChatPanel />
      </div>

    </div>
  );
}
