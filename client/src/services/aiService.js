import api from './api';

export const aiService = {
  async getStatus() {
    const res = await api.get('/ai/status');
    return res.data;
  },

  async enhanceSummary(summary, experience, skills) {
    const res = await api.post('/ai/enhance-summary', {
      summary,
      experience,
      skills,
    });
    return res.data;
  },

  async enhanceHighlights(role, company, highlights) {
    const res = await api.post('/ai/enhance-highlights', {
      role,
      company,
      highlights,
    });
    return res.data;
  },
};

