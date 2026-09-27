export default function Loading() {
  return <section className="route-loading" role="status" aria-live="polite" aria-busy="true">
    <div className="route-loading-mark" aria-hidden="true"><span /></div>
    <p><span className="loading-en">Loading your next view</span><span className="loading-ar" lang="ar">جارٍ تحميل الصفحة</span></p>
  </section>;
}
