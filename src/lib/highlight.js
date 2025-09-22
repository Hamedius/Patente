// هایلایت ساده: ترم‌ها را در متن ایتالیایی با span.hl-it می‌پیچد
// توجه: متن از JSON می‌آید، فرض را بر امن می‌گذاریم.
// اگر لازم شد، قبل از highlight کردن escape HTML هم می‌شود.
export function highlightIt(text, terms = [], enabled = true) {
  if (!enabled || !terms?.length || !text) return escapeHTML(text)
  // طولانی‌ها اول برای جلوگیری از هم‌پوشانی ناقص
  const sorted = [...terms].sort((a, b) => b.length - a.length)
  let out = escapeHTML(text)
  for (const raw of sorted) {
    const t = raw?.trim()
    if (!t) continue
    const re = new RegExp(`\\b${escapeRegExp(t)}\\b`, 'gi')
    out = out.replace(re, (m) => `<span class="hl-it">${m}</span>`)
  }
  return out
}

export function escapeHTML(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}