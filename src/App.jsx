import React, { useEffect, useRef, useState } from 'react'
import TopBar from './components/TopBar'
import SlideView from './components/SlideView'
import TopicList from './components/TopicList'
import SlideList from './components/SlideList'

/* ترجمهٔ دستی عنوان موضوع‌ها */
const manualFa = {
  '01': 'تعاریف کلی و الزامات استفاده از جاده',
  '02': 'علائم خطر',
  '03': 'علائم ممنوعیت',
  '04': 'علائم جاده‌ای اجباری',
  '05': 'علائم اولویت',
  '06': 'علائم افقی و علائم روی موانع',
  '07': 'چراغ‌های راهنمایی و افسران راهنمایی',
  '08': 'علائم جهت‌یابی',
  '09': 'تابلوهای علائم تکمیلی',
  '10': 'علائم اضافی، علائم موقت و علائم محل ساخت و ساز',
  '11': 'محدودیت سرعت، خطر و مانع ترافیک',
  '12': 'فاصله ایمنی',
  '13': 'مقررات راهنمایی و رانندگی',
  '14': 'نمونه‌هایی از اولویت (ترتیب تقدم در تقاطع‌ها)',
  '15': 'قوانین سبقت',
  '16': 'توقف، پارک، توقف و شروع حرکت',
  '17': 'قوانین متفرقه',
  '18': 'استفاده از چراغ‌ها و دستگاه‌های صوتی، چراغ‌های هشدار دهنده و نمادها',
  '19': 'تجهیزات، عملکرد و نحوه استفاده (کمربند ایمنی) ایمنی، سیستم‌های مهار کودک، کلاه ایمنی محافظ و لباس ایمنی',
  '20': 'گواهینامه رانندگی، سیستم جریمه، اسناد ثبت خودرو، تعهدات نسبت به پلیس، استفاده از لنزها و سایر وسایل',
  '21': 'تصادفات جاده‌ای و رفتار در صورت تصادف',
  '22': 'رانندگی با توجه به شرایط و ویژگی‌های جسمی و روانی، الکل، مواد مخدر، داروها و کمک‌های اولیه',
  '23': 'مسئولیت مدنی، کیفری و اداری، بیمه مسئولیت شخص ثالث و سایر بیمه‌نامه‌های مرتبط با خودرو',
  '24': 'محدودیت مصرف سوخت، احترام به محیط زیست و آلودگی',
  '25': 'اجزای خودرو، نگهداری و استفاده، پایداری و کنترل جاده، رفتار و اقدامات احتیاطی رانندگی',
}

function numFromFile(file) {
  const m = String(file || '').match(/^\s*(\d{1,2})/)
  return m ? m[1] : ''
}

/* نرمال‌سازی نام فایل و ساخت کاندیدها */
function toNFC(s) { return String(s || '').normalize('NFC') }
function stripInvisibles(s) {
  return String(s || '')
    .replace(/\u200c|\u200f|\u200e|\ufeff/g, '')
    .replace(/\u00a0/g, ' ')
}
function collapseSpaces(s) { return String(s || '').replace(/\s+/g, ' ').trim() }
function normalizeDashes(s) { return String(s || '').replace(/[\u2012\u2013\u2014\u2212]/g, '-') }
function altDashes(s) { return String(s || '').replace(/-/g, '–') }
function normalizeQuotes(s) { return String(s || '').replace(/[’‘]/g, "'") }
function trimBeforeDotJson(s){ return String(s || '').replace(/\s+\.json$/i, '.json') }
function withoutCommas(s) { return String(s || '').replace(/,/g, '') }
function composeItalianCombining(s) {
  return String(s || '')
    .replace(/a\u0300/g, 'à').replace(/e\u0300/g, 'è').replace(/i\u0300/g, 'ì')
    .replace(/o\u0300/g, 'ò').replace(/u\u0300/g, 'ù')
    .replace(/A\u0300/g, 'À').replace(/E\u0300/g, 'È').replace(/I\u0300/g, 'Ì')
    .replace(/O\u0300/g, 'Ò').replace(/U\u0300/g, 'Ù')
}
function ensureJsonSuffix(s) { const t = String(s || ''); return /\.json$/i.test(t) ? t : `${t}.json` }

function resolveDataUrls(file) {
  const raw = String(file || '')
  const v1 = ensureJsonSuffix(trimBeforeDotJson(collapseSpaces(stripInvisibles(toNFC(raw)))))
  const v2 = ensureJsonSuffix(trimBeforeDotJson(collapseSpaces(normalizeDashes(v1))))
  const v3 = ensureJsonSuffix(trimBeforeDotJson(collapseSpaces(normalizeQuotes(v2))))
  const v4 = ensureJsonSuffix(trimBeforeDotJson(collapseSpaces(composeItalianCombining(v3))))
  const v5 = ensureJsonSuffix(trimBeforeDotJson(collapseSpaces(altDashes(v4))))
  const v6 = ensureJsonSuffix(trimBeforeDotJson(collapseSpaces(withoutCommas(v4))))
  const v7 = ensureJsonSuffix(trimBeforeDotJson(collapseSpaces(withoutCommas(v5))))
  const names = []
  for (const n of [raw, v1, v2, v3, v4, v5, v6, v7]) {
    const name = ensureJsonSuffix(n); if (!names.includes(name)) names.push(name)
  }
  const urls = []
  for (const name of names) {
    const rawUrl = `/data/${name}`
    const encUrl = `/data/${encodeURIComponent(name)}`
    if (!urls.includes(rawUrl)) urls.push(rawUrl)
    if (!urls.includes(encUrl)) urls.push(encUrl)
  }
  return urls
}

function App() {
  const [view, setView] = useState('topics')   // 'topics' | 'slides' | 'slide'
  const [topics, setTopics] = useState([])
  const [topicIndex, setTopicIndex] = useState(0)
  const [slides, setSlides] = useState([])
  const [meta, setMeta] = useState(null)
  const [slideIndex, setSlideIndex] = useState(0)

  const [highlightIt, setHighlightIt] = useState(true) // ← دکمهٔ هایلایت

  // زبان ترجمهٔ نمایش داده‌شده در اسلاید (fa | en)
  const [showTrans, setShowTrans] = useState(false); // false=off
  const [transLang, setTransLang] = useState('fa');  // 'fa' | 'en'

  // عنوان‌های هدر
  const [topicTitle, setTopicTitle] = useState('')
  const [topicFaTitle, setTopicFaTitle] = useState('')

  // لودینگ/خطا
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // اسکرول
  const topicsScrollRef = useRef(0)
  const slideScrollRef = useRef(0)

  // ارتفاع هدر داینامیک
  // Removed per instructions

  // ایندکس موضوعات
  useEffect(() => {
    const loadIndex = async () => {
      try {
        const r = await fetch('/data/index.json', { cache: 'no-store' })
        const idx = await r.json()
        const arr = idx?.topics || []
        const sorted = [...arr].sort((a, b) => {
          const na = parseInt(numFromFile(a.file), 10) || Number.MAX_SAFE_INTEGER
          const nb = parseInt(numFromFile(b.file), 10) || Number.MAX_SAFE_INTEGER
          if (na !== nb) return na - nb
          return String(a.file || '').localeCompare(String(b.file || ''), 'it')
        })
        setTopics(sorted); setView('topics')
      } catch {
        try {
          const r2 = await fetch('/data/output.json', { cache: 'no-store' })
          const data = await r2.json()
          const single = [{ id: 'single', title: data?.meta?.topicTitle || 'موضوع', file: 'output.json' }]
          setTopics(single)
          setSlides(data.slides || [])
          setMeta(data.meta || null)
          setSlideIndex(0)
          setTopicTitle(String(single[0].file).replace(/\.json$/i,'') || 'موضوع')
          const nfRaw = numFromFile(single[0].file)
          const nfKey = String(nfRaw).padStart(2,'0')
          setTopicFaTitle(manualFa[nfKey] || manualFa[nfRaw] || '')
          setView('slides')
        } catch (e) { console.error('No data found', e) }
      }
    }
    loadIndex()
  }, [])

  // ورود به یک موضوع
  const loadTopic = async (index) => {
    const t = topics[index]; const file = t?.file; if (!file) return
    topicsScrollRef.current = window.scrollY || 0
    window.scrollTo({ top: 0, behavior: 'instant' })
    setTopicIndex(index); setSlides([]); setMeta(null); setSlideIndex(0); setErrorMsg(''); setLoading(true); setView('slides')

    const candidates = resolveDataUrls(file)
    let ok = false
    for (const url of candidates) {
      try {
        const r = await fetch(url, { cache: 'no-store' })
        if (!r.ok) throw new Error(r.status + ' ' + r.statusText)
        const data = await r.json()

        setSlides(data.slides || []); setMeta(data.meta || null)
        setTopicTitle(String(file).replace(/\.json$/i, ''))
        const nfRaw = numFromFile(file); const nfKey = String(nfRaw).padStart(2,'0')
        setTopicFaTitle(manualFa[nfKey] || manualFa[nfRaw] || '')
        ok = true; break
      } catch (e) { /* try next */ }
    }
    if (!ok) setErrorMsg('فایل این موضوع پیدا نشد یا خوانده نشد. نام فایل ممکن است کاراکتر خاص داشته باشد.')
    setLoading(false)
  }

  const onBack = () => {
    if (view === 'slide') {
      setView('slides')
      requestAnimationFrame(() => window.scrollTo({ top: slideScrollRef.current || 0, behavior: 'instant' }))
      return
    }
    if (view === 'slides') {
      setView('topics')
      requestAnimationFrame(() => window.scrollTo({ top: topicsScrollRef.current || 0, behavior: 'instant' }))
      return
    }
  }

  const curSlide = slides[slideIndex] || null
  const slideTitleIt = curSlide?.title_it || curSlide?.title || curSlide?.it || curSlide?.heading || ''
  const slideTitleFa = curSlide?.title_fa || curSlide?.fa || curSlide?.heading_fa || ''

  return (
    <div className="min-h-screen bg-gray-100">
      {/* CSS سراسری برای مخفی‌کردن ردیف موضوع در محتوای اسلاید و خاموش کردن هایلایت */}
      <style>{`
      /* تثبیت هدر در همه صفحات و جلوگیری از اسکرول هدر */
      html, body { height: 100%; overflow-y: auto; }
      header.fixed, .fixed.top-0 { position: fixed !important; top: 0; left: 0; right: 0; z-index: 9999; }

      /* فاصله‌ی محتوای صفحه از هدر (اگر جایی استایل اینلاین نبود) */
      .with-fixed-header { padding-top: 96px; }

      /* مخفی کردن عنوان/مترادف‌های تکراری در ابتدای محتوای اسلاید */
      .slide-content .topic-row,
      .slide-content .slide-tags,
      .slide-content .variants-row,
      .slide-content .synonyms,
      .slide-content > .text-center:first-child,
      .slide-content > h1:first-child,
      .slide-content > h2:first-child,
      .slide-content > h3:first-child,
      .slide-content > p:first-child strong:first-child,
      .slide-content > p:first-child em:first-child,
      .slide-content > p:first-child span:first-child,
      .slide-content > .slide-title:first-child,
      .slide-content > .title:first-child,
      /* گزینه‌های اضافی رایج: ردیف چیپ‌ها/برچسب‌های چندزبانه */
      .slide-content > .chips:first-child,
      .slide-content > .badges:first-child,
      .slide-content > .lang-switch:first-child,
      .slide-content > .tri-title:first-child,
      .slide-content > .multi-title:first-child,
      /* اگر اولین ردیف شامل آیکون/چیپ باشد */
      .slide-content > *:first-child:has(.chip),
      .slide-content > *:first-child:has(.tag),
      .slide-content > *:first-child:has(.badge) {
        display: none !important;
      }

      /* خاموشی هایلایت (وقتی highlightIt=false) */
      .slide-content.hl-off a,
      .slide-content.hl-off .hl,
      .slide-content.hl-off em {
        color: inherit !important;
        text-decoration: none !important;
        font-weight: inherit !important;
        border-bottom: none !important;
      }

      /* حذف قطعی ردیف عنوان سه‌زبانه (Grid سه ستونه)، بدون وابستگی به سلسله‌مراتب مستقیم و بدون :has */
      .slide-content .grid.grid-cols-3.items-center.gap-3.mb-4,
      .slide-content .grid.grid-cols-3.gap-3.mb-4,
      .slide-content .grid.grid-cols-3.items-center.mb-4,
      .slide-content .grid.grid-cols-3.mb-4 { display: none !important; }

      /* اگر بعد از آن المان بعدی فاصلهٔ عمودی دارد، جمعش کن */
      .slide-content .grid.grid-cols-3.mb-4 + * { margin-top: 0 !important; }

      /* نسخهٔ پشتیبان برای ساختارهای ساده‌ترِ سنتر شده */
      .slide-content .text-center.text-blue-600.font-semibold[dir="ltr"],
      .slide-content .text-right.text-blue-600.font-semibold.font-vazir[dir="rtl"] { display: none !important; }

      /* جعبهٔ ترجمهٔ فارسی: هر بلوک mb-4 که بچهٔ دومش راست به چپ است */
      .slide-content.lang-fa .mb-4 > [dir="rtl"]:not(:empty) {
        background: #f6f9ff; border: 1px solid #2563eb; border-radius: 10px; padding: 10px 12px; margin: 8px 0 16px; display: block; width: 100%; text-align: right; clear: both; box-shadow: 0 1px 2px rgba(37,99,235,.06);
      }
      .slide-content.lang-fa .mb-4 > [dir="rtl"] a {
        background: transparent; border: none; box-shadow: none;
      }

      /* جعبهٔ ترجمهٔ انگلیسی: در هر mb-4، بچهٔ دوم را کادربندی کن (div اول = ایتالیایی، div دوم = ترجمه) */
      .slide-content.lang-en .mb-4 > div:first-child + div:not(:empty) {
        background: #f6f9ff; border: 1px solid #2563eb; border-radius: 10px; padding: 10px 12px; margin: 8px 0 16px; display: block; width: 100%; text-align: left; clear: both; box-shadow: 0 1px 2px rgba(37,99,235,.06);
      }
      .slide-content.lang-en .mb-4 > div:first-child + div a {
        background: transparent; border: none; box-shadow: none;
      }

      /* وقتی ترجمه خاموش است، کادرها و فضایشان را حذف کن */
      .slide-content.tr-off .mb-4 > [dir="rtl"],
      .slide-content.tr-off .mb-4 > div:first-child + div { display: none !important; }
    `}</style>

      <TopBar
        view={view}
        onBack={onBack}
        topicTitle={topicTitle}
        topicFaTitle={topicFaTitle}
        slideTitleIt={slideTitleIt}
        slideTitleFa={slideTitleFa}
        showHighlightBtn={view === 'slide'}
        highlightOn={highlightIt}
        onToggleHighlight={() => setHighlightIt(v => !v)}
        showTranslateBtn={view === 'slide'}
        translateOn={showTrans}
        onToggleTranslate={() => setShowTrans(v => !v)}
        transLang={transLang}
        onCycleTransLang={() => setTransLang(l => (l === 'fa' ? 'en' : 'fa'))}
      />

      <div className="pb-8 px-4" style={{ paddingTop: 96 }}>
        {view === 'topics' && (
          <TopicList topics={topics} onPick={(i)=>loadTopic(i)} />
        )}

        {view === 'slides' && (
          <>
            {loading && <div className="max-w-3xl mx-auto text-sm text-gray-500">درحال بارگذاری…</div>}
            {errorMsg && !loading && (
              <div className="max-w-3xl mx-auto mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm" dir="rtl">
                {errorMsg}
              </div>
            )}
            <SlideList
              slides={slides}
              onPick={(i)=>{
                slideScrollRef.current = window.scrollY || 0
                setSlideIndex(i)
                setView('slide')
                window.scrollTo({ top: 0, behavior: 'instant' })
              }}
            />
          </>
        )}

        {view === 'slide' && (
          <div className={`slide-content ${highlightIt ? '' : 'hl-off'} ${showTrans ? `lang-${transLang}` : 'tr-off'}`}>
            {slides.length
              ? <SlideView slide={slides[slideIndex]} lang={transLang} highlight={highlightIt} hideHeader />
              : <div className="max-w-3xl mx-auto text-gray-500">محتوایی برای نمایش نیست.</div>}
          </div>
        )}
      </div>
    </div>
  )
}

export default App