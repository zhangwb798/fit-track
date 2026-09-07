const CONFIG_KEY = 'fitness_config_v1';

export interface FitnessConfig {
  firstWorkoutDate?: string; // YYYY-MM-DD，用户手动设置的第一次健身日期
  historicalCount?: number; // 历史累计健身次数（在打卡记录之前的次数）
}

const defaultConfig: FitnessConfig = {};

export function loadConfig(): FitnessConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return { ...defaultConfig };
    const data = JSON.parse(raw) as FitnessConfig;
    return data;
  } catch {
    return { ...defaultConfig };
  }
}

export function saveConfig(config: FitnessConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export function updateConfig(patch: Partial<FitnessConfig>): void {
  const current = loadConfig();
  saveConfig({ ...current, ...patch });
}
