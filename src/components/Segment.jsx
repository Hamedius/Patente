import React from 'react'
import { highlightIt, escapeHTML } from '../lib/highlight'

export default function Segment({ seg, lang = 'fa', terms = [], highlight = true }) {
  const itHtml = highlightIt(seg.it, terms, highlight)
  const tr = lang === 'fa' ? seg.fa : seg.en

  return (
    <div className="mb-4">
      {/* متن ایتالیایی */}
      <div
        className="text-base leading-7 text-gray-900"
        dir="ltr"
        dangerouslySetInnerHTML={{ __html: itHtml }}
      />
      {/* ترجمه */}
      <div className={`mt-1 ${lang === 'fa' ? 'text-right' : 'text-left'} text-base text-gray-700`} dir={lang==='fa'?'rtl':'ltr'}>
        {tr}
      </div>
    </div>
  )
}