const fs = require('fs');
const path = 'c:/Users/devha/Desktop/MML/frontend/src/pages/EntrepreneurDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

const target = `    try {
      const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
      });
      
      const imageBase64 = await toBase64(newAnnouncement.image);

      const payload = {
        title: newAnnouncement.title,
        description: newAnnouncement.description,
        category_id: null,
        custom_category: newAnnouncement.category,
        image_base64: imageBase64,
        expires_at: newAnnouncement.expires_at || undefined,
        project_id: selectedProject,
      };

      await api.createAnnouncement(payload);`.replace(/\r\n/g, '\n');

const replacement = `    try {
      const formData = new FormData();
      formData.append('title', newAnnouncement.title);
      formData.append('description', newAnnouncement.description);
      formData.append('custom_category', newAnnouncement.category);
      formData.append('image', newAnnouncement.image);
      if (newAnnouncement.expires_at) {
        formData.append('expires_at', newAnnouncement.expires_at);
      }
      formData.append('project_id', selectedProject);

      await api.createAnnouncement(formData);`;

const contentNormalized = content.replace(/\r\n/g, '\n');
const replaced = contentNormalized.replace(target, replacement);

if (contentNormalized === replaced) {
  console.log('REPLACEMENT FAILED: target not found.');
  process.exit(1);
}

fs.writeFileSync(path, replaced);
console.log('SUCCESS');
