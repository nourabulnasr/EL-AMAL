/** Small technical drawings, rendered on the server with no icon-library payload. */
export function MeasurementIcon({category}:{category:string}) {
  return <svg className="measurement-icon" viewBox="0 0 64 64" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {category === 'pressure' ? <>
      <circle cx="32" cy="27" r="20"/><circle cx="32" cy="27" r="15" className="icon-detail"/>
      <path d="M32 12v4M17 27h4M43 27h4M21.4 16.4l2.8 2.8M42.6 16.4l-2.8 2.8M27 47v8h10v-8M27 51h10M29 59h6"/>
      <path className="icon-needle" d="m32 27 9-10"/><circle cx="32" cy="27" r="2.5" fill="currentColor"/>
    </> : category === 'temperature' ? <>
      <path d="M26 37.6V12a6 6 0 0 1 12 0v25.6a12 12 0 1 1-12 0Z"/>
      <path d="M32 18v28"/><circle cx="32" cy="48" r="5" className="icon-detail" fill="currentColor" stroke="none"/>
      <path d="M44 14h8M44 22h5M44 30h8"/><path className="icon-detail" d="M12 20v16M8 24h8M8 32h8"/>
    </> : <>
      <path d="M14 26h36v19H14zM7 31h7M7 40h7M50 31h7M50 40h7M7 28v15M57 28v15M32 14v12M23 10h18v4H23zM27 45v11h10V45"/>
      <path className="icon-detail" d="M20 35.5h24M29 30l6 5.5-6 5.5M27 51h10"/>
    </>}
  </svg>;
}
