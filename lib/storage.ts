import { ref, get, set, child, push, update, remove } from 'firebase/database';
import { getFirebaseDatabase } from './firebase';

const getDbRef = (fileName: string) => {
  const db = getFirebaseDatabase();
  if (!db) return null;
  const key = fileName.replace('.json', '');
  return child(ref(db), key);
};

const firebaseToArray = (data: unknown): unknown[] => {
  if (!data || typeof data !== 'object') return [];
  const obj = data as Record<string, unknown>;
  if (Array.isArray(data)) return data;

  const keys = Object.keys(obj);
  if (keys.length === 0) return [];

  const isNumeric = keys.every(k => !isNaN(Number(k)));
  if (isNumeric) {
    return keys.sort((a, b) => Number(a) - Number(b)).map(k => obj[k]);
  }

  return [obj];
};

export const readJsonFile = async <T>(fileName: string): Promise<T> => {
  try {
    const dbRef = getDbRef(fileName);
    if (!dbRef) return [] as T;

    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      if (Array.isArray(data)) {
        return data as T;
      }
      const arr = firebaseToArray(data);
      return arr as T;
    }
    return [] as T;
  } catch (error) {
    console.error('Firebase read error:', error);
    return [] as T;
  }
};

export const writeJsonFile = async (fileName: string, data: unknown) => {
  try {
    const dbRef = getDbRef(fileName);
    if (!dbRef) return;

    await set(dbRef, data);
    return;
  } catch (error) {
    console.error('Firebase write error:', error);
    return;
  }
};

export const readJsonObject = async <T>(fileName: string): Promise<T | null> => {
  try {
    const dbRef = getDbRef(fileName);
    if (!dbRef) return null;

    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
      return snapshot.val() as T;
    }
    return null;
  } catch (error) {
    console.error('Firebase read error:', error);
    return null;
  }
};

export const readJsonFileOrDefault = async <T>(fileName: string, fallback: T): Promise<T> => {
  try {
    const dbRef = getDbRef(fileName);
    if (!dbRef) return fallback;

    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      if (Array.isArray(data)) {
        return data as T;
      }
      const arr = firebaseToArray(data);
      return (arr.length > 0 ? arr : fallback) as T;
    }
    await set(dbRef, fallback);
    return fallback;
  } catch (error) {
    console.error('Firebase read error:', error);
    return fallback;
  }
};

export const readJsonObjectOrDefault = async <T>(fileName: string, fallback: T): Promise<T> => {
  try {
    const dbRef = getDbRef(fileName);
    if (!dbRef) return fallback;

    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
      return snapshot.val() as T;
    }
    await set(dbRef, fallback);
    return fallback;
  } catch (error) {
    console.error('Firebase read error:', error);
    return fallback;
  }
};

export const pushToArray = async (fileName: string, data: unknown): Promise<string> => {
  const db = getFirebaseDatabase();
  if (!db) return '';

  const newRef = push(child(ref(db), fileName.replace('.json', '')));
  await set(newRef, data);
  return newRef.key || '';
};

export const updateData = async (fileName: string, data: unknown) => {
  try {
    const dbRef = getDbRef(fileName);
    if (!dbRef) return;

    await update(dbRef, data as Record<string, unknown>);
    return;
  } catch (error) {
    console.error('Firebase update error:', error);
    return;
  }
};

export const deleteData = async (fileName: string) => {
  try {
    const dbRef = getDbRef(fileName);
    if (!dbRef) return;

    await remove(dbRef);
    return;
  } catch (error) {
    console.error('Firebase delete error:', error);
    return;
  }
};
