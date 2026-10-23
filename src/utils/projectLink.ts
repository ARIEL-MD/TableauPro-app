import { Capacitor } from '@capacitor/core';
import type { ElectricalPanelProject } from '../types/panel';

/** Adresse publique de la version web (GitHub Pages) : c'est elle que l'APK met dans les liens. */
export const PUBLIC_APP_URL = 'https://ariel-md.github.io/TableauPro-app/';

/**
 * Lien de projet : le projet entier est compressé (gzip) puis encodé en base64url
 * dans la partie « # » de l'adresse. Aucun serveur n'est nécessaire.
 */
const HASH_KEY = 'p=';

const toBase64Url = (bytes: Uint8Array): string => {
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromBase64Url = (text: string): Uint8Array => {
  const b64 = text.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};

const pipe = async (data: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> => {
  const out = new Response(new Blob([data as BlobPart]).stream().pipeThrough(stream));
  return new Uint8Array(await out.arrayBuffer());
};

export const encodeProjectLink = async (project: ElectricalPanelProject): Promise<string> => {
  const json = new TextEncoder().encode(JSON.stringify(project));
  const packed = await pipe(json, new CompressionStream('gzip'));
  // Dans l'APK, l'adresse interne (https://localhost) est inutilisable ailleurs : on met l'adresse publique.
  const base = Capacitor.isNativePlatform() ? PUBLIC_APP_URL : `${window.location.origin}${window.location.pathname}`;
  return `${base}#${HASH_KEY}${toBase64Url(packed)}`;
};

/** Accepte un lien complet ou seulement la partie après « # ». Renvoie null si illisible. */
export const decodeProjectLink = async (link: string): Promise<ElectricalPanelProject | null> => {
  try {
    const idx = link.indexOf(`#${HASH_KEY}`);
    const payload = idx >= 0 ? link.slice(idx + 1 + HASH_KEY.length) : link.replace(/^#?p=/, '');
    if (!payload) return null;
    const raw = await pipe(fromBase64Url(payload.trim()), new DecompressionStream('gzip'));
    const parsed = JSON.parse(new TextDecoder().decode(raw));
    return parsed && Array.isArray(parsed.rails) && Array.isArray(parsed.devices) ? parsed : null;
  } catch {
    return null;
  }
};

export const hasProjectInHash = (): boolean => window.location.hash.startsWith(`#${HASH_KEY}`);
