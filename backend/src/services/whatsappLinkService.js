/**
 * Genera el enlace de WhatsApp (wa.me) para enmascarar el contacto del emprendedor.
 * @param {string|number} phoneNumber 
 * @returns {string|null}
 */
function generateWaLink(phoneNumber) {
  if (!phoneNumber) return null;
  
  const cleanNumber = String(phoneNumber).replace(/\D/g, '');
  if (!cleanNumber) return null;

  return `https://wa.me/${cleanNumber}`;
}

module.exports = {
  generateWaLink,
};