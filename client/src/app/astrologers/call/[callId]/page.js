"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation"; // Import useRouter
import { useSelector } from "react-redux";
import { useCall } from "../../../hooks/useCall";
import { useZego } from "../../../hooks/useZego";
import {
  FaPhoneSlash, FaWallet, FaExclamationTriangle, FaSpinner
} from "react-icons/fa";

export default function UserCallPage() {
  const { callId } = useParams();
  const router = useRouter(); // Use Router
  const user = useSelector((state) => state.auth.user);
  const identity = user ? `user_${user._id}` : null;

  const {
    call,
    callStatus,
    duration,
    walletBalance,
    zegoToken,
    zegoRoomId,
    appId,
    endCall,
    formatDuration,
    lowBalanceAlert // Get the alert state
  } = useCall(callId, identity);

  // --- REDIRECTION LOGIC ---
  useEffect(() => {
    let timeout;
    if (callStatus === "ENDED") {
        // Wait 3 seconds to show "Call Ended" message, then redirect
        timeout = setTimeout(() => {
            window.location.href = "/astrologers"; // Force reload to clear Zego
        }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [callStatus]);

  // Only mount Zego if we have a token and status is CONNECTED
  const shouldMountZego = callStatus === "CONNECTED" && zegoToken && zegoRoomId;

  const { containerRef } = useZego({
    appId,
    token: zegoToken,
    roomId: zegoRoomId,
    userId: identity,
    userName: user?.name,
    enabled: shouldMountZego
  });

  if (!user) return <div className="p-10 text-white">Loading User...</div>;

  return (
    <div className="fixed inset-0 w-full h-full bg-black">
      
      {/* --- LOW BALANCE FULL SCREEN OVERLAY WARNING --- */}
      {lowBalanceAlert && callStatus === "CONNECTED" && (
          <div className="absolute top-20 left-0 w-full z-[60] animate-pulse">
              <div className="bg-red-600 text-white px-6 py-3 mx-4 rounded-xl shadow-2xl border-2 border-yellow-400 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <FaExclamationTriangle className="text-3xl text-yellow-300" />
                      <div>
                          <h3 className="font-bold text-lg">Low Balance!</h3>
                          <p className="text-sm">Call ends in less than 1 minute.</p>
                      </div>
                  </div>
                  <div className="bg-white text-red-600 px-4 py-2 rounded-lg font-bold">
                      ₹{walletBalance}
                  </div>
              </div>
          </div>
      )}

      {/* --- STATUS OVERLAY --- */}
      <div className="absolute top-0 left-0 w-full z-50 p-4 flex justify-between items-start bg-gradient-to-b from-black/70 to-transparent">
         <div className="flex items-center gap-3">
            {/** 
             <div className="bg-white/10 p-2 rounded-full backdrop-blur-md">
                 <FaWallet className="text-yellow-400" />
             </div>
             <div>
                 <p className="text-xs text-gray-300">Balance</p>
                 <p className="text-white font-bold">₹{walletBalance}</p>
             </div>
             */}
         </div>
         
         <div className="flex flex-col items-end">
             <div className={`px-4 py-1 rounded-full text-white font-mono shadow-lg transition-colors duration-300 ${lowBalanceAlert ? 'bg-red-600' : 'bg-gray-800/80'}`}>
                 {formatDuration(duration)}
             </div>
         </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      {shouldMountZego ? (
        <div ref={containerRef} className="w-full h-full" />
      ) : (
        /* CONNECTING / ENDED UI */
        <div className="flex flex-col items-center justify-center h-full text-white space-y-6 relative z-40">
            <div className="w-24 h-24 rounded-full bg-gray-800 overflow-hidden border-4 border-gray-600">
                <img src={call?.astrologer?.profileImageUrl} className="w-full h-full object-cover"/>
            </div>
            
            <div className="text-center">
                <h2 className="text-2xl font-bold">{call?.astrologer?.fullName}</h2>
                <p className="text-blue-400 mt-2">
                    {callStatus === "ENDED" 
                        ? <span className="text-red-400 font-bold">Call Ended</span> 
                        : "Connecting..."}
                </p>
            </div>

            {/* REDIRECTING MESSAGE */}
            {callStatus === "ENDED" && (
                <div className="mt-8 flex flex-col items-center animate-fadeIn">
                    <FaSpinner className="animate-spin text-3xl text-white mb-3" />
                    <div className="bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-xl border border-white/30 text-center">
                        <p className="font-bold text-lg">Redirecting...</p>
                        <p className="text-sm opacity-80">Taking you back to astrologers list</p>
                    </div>
                </div>
            )}
        </div>
      )}

      {/* --- CONTROLS --- */}
      {callStatus !== "ENDED" && (
          <div className="absolute bottom-16 left-0 w-full flex justify-center gap-6 z-50">
            <button 
                onClick={endCall} 
                className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
            >
                <FaPhoneSlash className="text-white text-2xl" />
            </button>
          </div>
      )}
    </div>
  );
}