import { ref, get, set, child, push, update, remove } from 'firebase/database';
import { database } from './firebase';
import { promises as fs } from 'fs';
import path from 'path';

const isVercel = process.env.VERCEL === '1';
const dataPath = path.join(process.cwd(), 'data');

const ensureDataDir = async () => {
  await fs.mkdir(dataPath, { recursive: true });
};

const getDbRef = (fileName: string) => {
  const key = fileName.replace('.json', '');
  return child(ref(database), key);
};

export const readJsonFile = async <T>(fileName: string): Promise<T> => {
  if (isVercel) {
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
  }
  
  await ensureDataDir();
  const filePath = path.join(dataPath, fileName);
  try {
    const file = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(file) as T;
  } catch {
    return {} as T;
  }
};

export const writeJsonFile = async (fileName: string, data: unknown) => {
  if (isVercel) {
    try {
      await set(getDbRef(fileName), data);
      return;
    } catch (error) {
      console.error('Firebase write error:', error);
      return;
    }
  }
  
  await ensureDataDir();
  const filePath = path.join(dataPath, fileName);
  const tmpPath = `${filePath}.tmp`;
  await fs.writeFile(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
  await fs.rename(tmpPath, filePath);
};

export const readJsonFileOrDefault = async <T>(fileName: string, fallback: T): Promise<T> => {
  if (isVercel) {
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
  }
  
  try {
    return await readJsonFile<T>(fileName);
  } catch {
    await writeJsonFile(fileName, fallback);
    return fallback;
  }
};

export const pushToArray = async (fileName: string, data: unknown): Promise<string> => {
  if (isVercel) {
    const newRef = push(child(ref(database), fileName.replace('.json', '')));
    await set(newRef, data);
    return newRef.key || '';
  }
  
  const existing = await readJsonFile<Record<string, unknown>[]>(fileName).catch(() => []);
  const newId = Date.now().toString();
  const updated = { ...existing, [newId]: data };
  await writeJsonFile(fileName, updated);
  return newId;
};

export const updateData = async (fileName: string, data: unknown) => {
  if (isVercel) {
    try {
      await update(getDbRef(fileName), data as Record<string, unknown>);
      return;
    } catch (error) {
      console.error('Firebase update error:', error);
      return;
    }
  }
  
  const existing = await readJsonFile<Record<string, unknown>>(fileName).catch(() => ({}));
  const updated = { ...existing, ...(data as Record<string, unknown>) };
  await writeJsonFile(fileName, updated);
};

export const deleteData = async (fileName: string) => {
  if (isVercel) {
    try {
      await remove(getDbRef(fileName));
      return;
    } catch (error) {
      console.error('Firebase delete error:', error);
      return;
    }
  }
  
  const filePath = path.join(dataPath, fileName);
  await fs.unlink(filePath).catch(() => {});
};
