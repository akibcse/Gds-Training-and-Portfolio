import { kv } from '@vercel/kv';
import { promises as fs } from 'fs';
import path from 'path';

const isVercel = process.env.VERCEL === '1';
const dataPath = path.join(process.cwd(), 'data');

const ensureDataDir = async () => {
  await fs.mkdir(dataPath, { recursive: true });
};

export const readJsonFile = async <T>(fileName: string): Promise<T> => {
  if (isVercel) {
    const data = await kv.get<T>(fileName);
    if (data) return data;
    return {} as T;
  }
  await ensureDataDir();
  const filePath = path.join(dataPath, fileName);
  const file = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(file) as T;
};

export const writeJsonFile = async (fileName: string, data: unknown) => {
  if (isVercel) {
    await kv.set(fileName, data);
    return;
  }
  await ensureDataDir();
  const filePath = path.join(dataPath, fileName);
  const tmpPath = `${filePath}.tmp`;
  await fs.writeFile(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
  await fs.rename(tmpPath, filePath);
};

export const readJsonFileOrDefault = async <T>(fileName: string, fallback: T): Promise<T> => {
  if (isVercel) {
    const data = await kv.get<T>(fileName);
    if (data) return data;
    await kv.set(fileName, fallback);
    return fallback;
  }
  try {
    return await readJsonFile<T>(fileName);
  } catch {
    await writeJsonFile(fileName, fallback);
    return fallback;
  }
};
