// Minimal sanitizer for admin-uploaded HTML passages.
// This is intentionally basic (regex-based, no external dependency) - good
// enough to strip the obviously dangerous stuff (scripts, inline event
// handlers, javascript: URLs, iframes/objects) from content that trusted
// admins upload. It is NOT a substitute for a full sanitizer if this app
// ever accepts HTML from untrusted/public users.
const sanitizeHtml = (html) => {
  if (!html) return '';
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[^>]*>/gi, '')
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son\w+\s*=\s*'[^']*'/gi, '')
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, '')
    .replace(/(href|src)\s*=\s*"javascript:[^"]*"/gi, '$1="#"')
    .replace(/(href|src)\s*=\s*'javascript:[^']*'/gi, "$1='#'");
};

module.exports = sanitizeHtml;
