export const getGradeColor = (grade: string) => {
  if (!grade) return '#64748b'; // slate-500
  if (grade.startsWith('A')) return '#10b981'; // emerald-500
  if (grade.startsWith('B')) return '#3b82f6'; // blue-500
  if (grade.startsWith('C')) return '#f59e0b'; // amber-500
  if (grade.startsWith('D')) return '#f97316'; // orange-500
  return '#ef4444'; // red-500 (F)
};

export const getScoreColor = (score: number) => {
  if (score >= 90) return '#10b981';
  if (score >= 70) return '#f59e0b';
  return '#ef4444';
};
