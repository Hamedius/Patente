import React from 'react';

/**
 * SlideView
 *
 * props:
 * - slide: can be:
 *      {blocks|items|content: Array&lt;{it?, fa?, en?, title_it?, title_fa?, title_en?}&gt;}
 *      OR an Array of such blocks
 *      OR a single block object
 *      OR a plain HTML string (treated as Italian)
 * - lang: 'fa' | 'en'  -> which translation language to show
 * - showTranslation: boolean -> show / hide translation blocks
 * - highlight: boolean -> highlight Italian keywords (adds .no-hl when false)
 */
export default function SlideView({
  slide = {},
  lang = 'fa',
  showTranslation = false,
  highlight = true,
}) {
  // --- Normalize input into an array of { it, fa, en } blocks -----------------
  let blocks = [];

  const asBlock = (b) => {
    if (b == null) return null;
    if (typeof b === 'string') return { it: b };
    if (typeof b === 'object') {
      return {
        it: b.it ?? b.title_it ?? b.title ?? '',
        fa: b.fa ?? b.title_fa ?? '',
        en: b.en ?? b.title_en ?? '',
      };
    }
    return null;
  };

  if (Array.isArray(slide?.blocks)) blocks = slide.blocks.map(asBlock);
  else if (Array.isArray(slide?.items)) blocks = slide.items.map(asBlock);
  else if (Array.isArray(slide?.content)) blocks = slide.content.map(asBlock);
  else if (Array.isArray(slide)) blocks = slide.map(asBlock);
  else if (typeof slide === 'object' || typeof slide === 'string') {
    const one = asBlock(slide);
    if (one) blocks = [one];
  }

  // Fallback: nothing to show
  if (!blocks || !blocks.length) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="text-center text-gray-400 py-10 text-sm">
          {/* محتوا یافت نشد */}
        </div>
      </div>
    );
  }

  const itClass = `text-base leading-7 text-gray-900 ${highlight ? '' : 'no-hl'}`;

  return (
    <div className="max-w-3xl mx-auto">
      {blocks.map((b, i) => {
        const itText = b.it || '';
        const faText = b.fa || '';
        const enText = b.en || '';

        const trText = lang === 'fa' ? faText : enText;
        const trDir = lang === 'fa' ? 'rtl' : 'ltr';
        const trAlign = lang === 'fa' ? 'text-right' : 'text-left';

        return (
          <div className="mb-6" key={i}>
            {/* Italian source (always visible) */}
            {itText ? (
              <div
                className={itClass}
                dir="ltr"
                dangerouslySetInnerHTML={{ __html: itText }}
              />
            ) : null}

            {/* Translation card (only when toggled on AND text exists) */}
            {showTranslation && trText ? (
              <div
                className={`mt-2 ${trAlign} tr-card`}
                dir={trDir}
                dangerouslySetInnerHTML={{ __html: trText }}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}