/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App and Auth
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Request Workspace scopes for Google Drive
provider.addScope('https://www.googleapis.com/auth/drive');
provider.addScope('https://www.googleapis.com/auth/drive.appdata');
provider.addScope('https://www.googleapis.com/auth/drive.file');

// In-memory token cache
let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Initialize auth state listener. Must be called on app load.
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else {
        // Clear cached token if we somehow lose track
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Initiate Google Sign-In with popup
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  if (isSigningIn) return null;
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to retrieve Google Drive access token from authentication provider.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('[GoogleDriveService] Error during Google login:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Sign out from Firebase and clear cached token
export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

// Retrieve current cached token
export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

// Manually set access token (e.g. from state)
export const setAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

// Google Drive Interfaces
export interface DriveItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  iconLink?: string;
  thumbnailLink?: string;
}

// Drive client helper functions
export const listDriveContents = async (
  folderId: string = 'root',
  searchQuery: string = ''
): Promise<DriveItem[]> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error('User is not authenticated. Cannot list Google Drive files.');
  }

  // Construct queries to target retro gaming files (.nes, .sfc, .smc, .bin, .gba, .gbc, .gb, .zip)
  let query = `'${folderId}' in parents and trashed = false`;
  if (searchQuery) {
    query += ` and name contains '${searchQuery}'`;
  }

  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,size,iconLink,thumbnailLink)&pageSize=100`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`Google Drive API error: ${res.statusText}`);
  }

  const data = await res.json();
  return data.files || [];
};

// Download a ROM file as a safe client-side Blob Object URL
export const fetchDriveFileBlob = async (fileId: string): Promise<Blob> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error('User is not authenticated. Cannot download Google Drive file.');
  }

  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`Failed to download game file from Google Drive: ${res.status} ${res.statusText}`);
  }

  return await res.blob();
};

/**
 * Saves and backs up custom games data to a JSON file named `retro_hub_backup.json` of Google Drive
 * implementing the user-mutating instructions correctly with clear feedback.
 */
export const uploadLibraryBackup = async (systemsDataBackup: any): Promise<DriveItem> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error('User is not authenticated. Cannot write backup file.');
  }

  const filename = 'retro_hub_backup.json';
  
  // 1. Search if the file already exists
  const searchQuery = `name = '${filename}' and trashed = false`;
  const listUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(searchQuery)}&fields=files(id)`;
  const listRes = await fetch(listUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const listData = await listRes.json();
  const existingFiles = listData.files || [];

  const boundary = '314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = {
    name: filename,
    mimeType: 'application/json',
  };

  const fileContent = JSON.stringify(systemsDataBackup, null, 2);
  const multipartBody = 
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    fileContent +
    closeDelimiter;

  let url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
  let method = 'POST';

  if (existingFiles.length > 0) {
    // Update existing file instead of creating new duplicates
    const existingFileId = existingFiles[0].id;
    url = `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart`;
    method = 'PATCH';
  }

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartBody,
  });

  if (!res.ok) {
    throw new Error(`Failed to upload library backup to Google Drive: ${res.statusText}`);
  }

  return await res.json();
};

/**
 * Download a library backup from the google drive
 */
export const downloadLibraryBackup = async (): Promise<any | null> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error('User is not authenticated. Cannot read backup file.');
  }

  const filename = 'retro_hub_backup.json';
  
  // Search for file
  const searchQuery = `name = '${filename}' and trashed = false`;
  const listUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(searchQuery)}&fields=files(id)`;
  const listRes = await fetch(listUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const listData = await listRes.json();
  const existingFiles = listData.files || [];

  if (existingFiles.length === 0) {
    return null;
  }

  const fileId = existingFiles[0].id;
  const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  
  const res = await fetch(downloadUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`Failed to download backup file: ${res.statusText}`);
  }

  return await res.json();
};
