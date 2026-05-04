export const tokens = {
  // brand
  colorPrimary: '#F4941A',
  gradientPrimary: 'linear-gradient(135deg, #F4941A 0%, #FFB86B 100%)',

  // backgrounds
  bgLight: '#ffffff',
  bgDark: '#071226',

  // chart / dashboard specific palettes
  chart: {
    line: 'var(--color-primary)',
    area: 'rgba(244,148,26,0.12)',
    // small palette variations for multi-series charts (light/dark aware)
    series: {
      primary: '#F4941A',
      accent: '#6C5CE7',
      positive: '#00B894',
      info: '#0984E3',
      muted: '#9AA4B2',
      subtle: 'rgba(244,148,26,0.18)'
    },
    tooltipBg: 'var(--bg)',
    tooltipText: 'var(--text)',
  },

  // heatmap for calendar (5 intensity steps, 0..4)
  heatmap: {
    0: 'transparent',
    1: '#FFF5E6',
    2: '#FFE2B3',
    3: '#FFC280',
    4: '#FF9A2E'
  }
};

