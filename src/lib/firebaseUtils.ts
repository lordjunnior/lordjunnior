/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  getDocFromServer
} from 'firebase/firestore';
import { db, auth } from './firebase.ts';
import { Game } from '../types.ts';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection check
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[Firebase] Connection validation succeeded.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

// Favorites Sync Helpers
export function encodeGameKey(systemId: string, gameTitle: string): string {
  // Use a format safe for Firestore document IDs
  const safeTitle = gameTitle.replace(/[\/\\#\?]/g, '_').substring(0, 80);
  return `${systemId}__${safeTitle}`;
}

export async function saveFavoriteToCloud(userId: string, systemId: string, gameTitle: string) {
  const gameKey = encodeGameKey(systemId, gameTitle);
  const path = `users/${userId}/favorites/${gameKey}`;
  try {
    await setDoc(doc(db, 'users', userId, 'favorites', gameKey), {
      systemId,
      gameTitle,
      addedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function removeFavoriteFromCloud(userId: string, systemId: string, gameTitle: string) {
  const gameKey = encodeGameKey(systemId, gameTitle);
  const path = `users/${userId}/favorites/${gameKey}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'favorites', gameKey));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function getFavoritesFromCloud(userId: string): Promise<string[]> {
  const path = `users/${userId}/favorites`;
  try {
    const querySnapshot = await getDocs(collection(db, 'users', userId, 'favorites'));
    const favorites: string[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.systemId && data.gameTitle) {
        favorites.push(`${data.systemId}::${data.gameTitle}`);
      }
    });
    return favorites;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

// Custom Games Sync Helpers
export async function saveCustomGameToCloud(userId: string, systemId: string, game: Game) {
  const path = `users/${userId}/customGames/${game.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'customGames', game.id), {
      id: game.id,
      systemId,
      title: game.title,
      year: game.year || 'Unknown',
      genre: game.genre || 'Action',
      developer: game.developer || 'Unknown',
      publisher: game.publisher || 'Unknown',
      players: game.players || '1',
      rating: game.rating || 5,
      description: game.description || '',
      image: game.image || '',
      romUrl: game.romUrl,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function removeCustomGameFromCloud(userId: string, gameId: string) {
  const path = `users/${userId}/customGames/${gameId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'customGames', gameId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function getCustomGamesFromCloud(userId: string): Promise<{ systemId: string, game: Game }[]> {
  const path = `users/${userId}/customGames`;
  try {
    const querySnapshot = await getDocs(collection(db, 'users', userId, 'customGames'));
    const customGames: { systemId: string, game: Game }[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      customGames.push({
        systemId: data.systemId,
        game: {
          id: data.id,
          title: data.title,
          year: data.year,
          genre: data.genre,
          developer: data.developer,
          publisher: data.publisher,
          players: data.players,
          rating: data.rating,
          description: data.description,
          image: data.image,
          romUrl: data.romUrl,
          favorite: false
        } as Game
      });
    });
    return customGames;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

// Sync User metadata
export async function syncUserMetadata(userId: string, email: string) {
  const path = `users/${userId}`;
  try {
    await setDoc(doc(db, 'users', userId), {
      uid: userId,
      email: email,
      createdAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
