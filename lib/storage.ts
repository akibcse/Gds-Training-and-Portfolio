import { ref, get, set, child, push, update, remove } from 'firebase/database';
import { database } from './firebase';

const getDbRef = (fileName: string) => {
  const key = fileName.replace('.json', '');
  return child(ref(database), key);
};

export const readJsonFile = async <T>(fileName: string): Promise<T> => {
  try {
    const snapshot = await get(getDbRef(fileName));
    if (snapshot.exists()) {
      return snapshot.val() as T;
    }
    return {} as T;
  } catch (error) {
    console.error('Firebase read error:', error);
    return {} as T;
  }
};

export const writeJsonFile = async (fileName: string, data: unknown) => {
  try {
    await set(getDbRef(fileName), data);
    return;
  } catch (error) {
    console.error('Firebase write error:', error);
    return;
  }
};

export const readJsonFileOrDefault = async <T>(fileName: string, fallback: T): Promise<T> => {
  try {
    const snapshot = await get(getDbRef(fileName));
    if (snapshot.exists()) {
      return snapshot.val() as T;
    }
    await set(getDbRef(fileName), fallback);
    return fallback;
  } catch (error) {
    console.error('Firebase read error:', error);
    return fallback;
  }
};

export const pushToArray = async (fileName: string, data: unknown): Promise<string> => {
  const newRef = push(child(ref(database), fileName.replace('.json', '')));
  await set(newRef, data);
  return newRef.key || '';
};

export const updateData = async (fileName: string, data: unknown) => {
  try {
    await update(getDbRef(fileName), data as Record<string, unknown>);
    return;
  } catch (error) {
    console.error('Firebase update error:', error);
    return;
  }
};

export const deleteData = async (fileName: string) => {
  try {
    await remove(getDbRef(fileName));
    return;
  } catch (error) {
    console.error('Firebase delete error:', error);
    return;
  }
};
