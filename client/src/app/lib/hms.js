// src/app/lib/hms.js
import { HMSReactiveStore } from "@100mslive/hms-video-store";

let instance = null;

export const getHMS = () => {
  if (!instance) {
    instance = new HMSReactiveStore();
  }
  return instance;
};
