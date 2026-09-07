// 锻炼部位定义
export type BodyPart = 'chest' | 'back' | 'shoulder' | 'arm' | 'leg' | 'core' | 'cardio';

export const BODY_PARTS: { key: BodyPart; label: string; color: string; icon: string }[] = [
  { key: 'chest', label: '胸', color: '#FF6B35', icon: '💪' },
  { key: 'back', label: '背', color: '#00C2A8', icon: '🦴' },
  { key: 'shoulder', label: '肩', color: '#5B8DEF', icon: '🏋️' },
  { key: 'arm', label: '臂', color: '#A66EFF', icon: '💥' },
  { key: 'leg', label: '腿', color: '#FFB020', icon: '🦵' },
  { key: 'core', label: '核心', color: '#FF4D6D', icon: '🔥' },
  { key: 'cardio', label: '有氧', color: '#2ECC71', icon: '🏃' },
];

export function getPartLabel(key: BodyPart): string {
  return BODY_PARTS.find(p => p.key === key)?.label ?? key;
}

export function getPartColor(key: BodyPart): string {
  return BODY_PARTS.find(p => p.key === key)?.color ?? '#888';
}
