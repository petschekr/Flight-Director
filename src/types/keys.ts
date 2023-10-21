import type { InjectionKey, Ref } from "vue";
import type { Configuration } from "@/types/configuration";

export const CONFIGURATION = Symbol() as InjectionKey<Ref<Configuration | null>>;
export const EDIT_MODE = Symbol() as InjectionKey<Ref<boolean>>;

export type OpenAlert = (title: string, message: string, cancelText?: string) => Promise<void>;
export const OPEN_ALERT = Symbol() as InjectionKey<OpenAlert>;

export type OpenConfirm = (title: string, message: string, confirmText?: string, cancelText?: string) => Promise<boolean>;
export const OPEN_CONFIRM = Symbol() as InjectionKey<OpenConfirm>;

export type GenerateShortCallsign = (callsign: string) => string;
export const GENERATE_SHORT_CALLSIGN = Symbol() as InjectionKey<GenerateShortCallsign>;

export type ProcessPathReplacements = (path: string, callsign?: string) => string;
export const PROCESS_PATH_REPLACEMENTS = Symbol() as InjectionKey<ProcessPathReplacements>;
