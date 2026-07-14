export const getTrustColor = (value: number) => {
  if (value >= 80) return '#10b981'; // Emerald - Strong
  if (value >= 60) return '#3b82f6'; // Blue - Moderate
  if (value >= 40) return '#f59e0b'; // Amber - Weak
  if (value >= 20) return '#f97316'; // Orange - Poor
  return '#ef4444'; // Red - Critical
};

export const getRiskColor = (level: string) => {
  switch (level.toLowerCase()) {
    case 'low': return '#10b981';
    case 'medium': return '#f59e0b';
    case 'high': return '#f97316';
    case 'critical': return '#ef4444';
    default: return '#6366f1';
  }
};
