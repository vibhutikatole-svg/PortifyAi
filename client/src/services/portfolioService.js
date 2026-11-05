import api from './api';

export const portfolioService = {
  async getPortfolios() {
    const res = await api.get('/portfolios');
    return res.data.portfolios;
  },

  async getPortfolioById(id) {
    const res = await api.get(`/portfolios/${id}`);
    return res.data.portfolio;
  },

  async updatePortfolio(id, data) {
    const res = await api.put(`/portfolios/${id}`, data);
    return res.data.portfolio;
  },

  async deletePortfolio(id) {
    const res = await api.delete(`/portfolios/${id}`);
    return res.data;
  },

  async getPublicPortfolio(slug) {
    const res = await api.get(`/portfolios/public/${slug}`);
    const portfolio = res.data.portfolio;
    if (portfolio) {
      portfolio._isOwnerPreview = Boolean(res.data.isOwnerPreview);
    }
    return portfolio;
  },

  async downloadPublicPortfolioZip(slug) {
    const response = await fetch(`/api/portfolios/public/${slug}/zip`);
    if (!response.ok) {
      throw new Error('Failed to download public ZIP export.');
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `portify-${slug}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  async getPortfolioQR(id) {
    const res = await api.get(`/portfolios/${id}/qr`);
    return res.data;
  },

  async generatePortfolio(id, payload = {}) {
    const res = await api.post(`/portfolios/${id}/generate`, payload);
    return res.data;
  },

  async regenerateSection(id, section, sectionData = null) {
    const res = await api.post(`/portfolios/${id}/regenerate-section`, {
      section,
      sectionData,
    });
    return res.data;
  },

  async downloadPortfolioZip(id, slug) {
    const token = localStorage.getItem('portify_token');
    const response = await fetch(`/api/portfolios/${id}/zip`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download ZIP archive.');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `portify-${slug || 'portfolio'}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  async uploadAvatar(id, file) {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await api.post(`/portfolios/${id}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  async deleteAvatar(id) {
    const res = await api.delete(`/portfolios/${id}/avatar`);
    return res.data;
  },
};

