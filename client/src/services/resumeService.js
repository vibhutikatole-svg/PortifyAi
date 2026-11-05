import api from './api';

export const resumeService = {
  async uploadResume(file, onUploadProgress) {
    const formData = new FormData();
    formData.append('resume', file);

    const res = await api.post('/resume/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });

    return res.data;
  },

  async previewExtract(file) {
    const formData = new FormData();
    formData.append('resume', file);

    const res = await api.post('/resume/preview-extract', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return res.data;
  },
};

