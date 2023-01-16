import { writable } from 'svelte/store';

export const guardians = writable([]);
export const isClientLoaded = writable(false);
export const isManifestLoaded = writable(false);
export const isUserDataLoaded = writable(false);
export const areAdsDisabled = writable(false);

export const pageTitle = writable("GuardianForge")