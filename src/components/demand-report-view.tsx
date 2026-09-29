import {DEMAND_EXPORT_LIMIT,demandCohortLabels,type DemandQuery,type DemandReport} from '@/lib/demand-report';
const number=(value:number)=>new Intl.NumberFormat('en').format(value);
function reportLink(filters:DemandQuery,page:number,format:'json'|'csv'='json'){
  const params=new URLSearchParams({start:filters.start,end:filters.end,cohort:filters.cohort,model:filters.model,range:filters.range,page:String(page),pageSize:String(filters.pageSize)});
  if(format==='csv')params.set('format','csv');
  return `${format==='csv'?'/api/staff/demand-report':'/staff/reports'}?${params}`;
}
export function DemandReportView({report}:{report:DemandReport}){
  const {filters,totals}=report;
  return <>
    <section className="demand-heading">
      <h1>What customers request.</h1>
      <p>Model and range demand from saved enquiries. Counts reflect the requested units at submission and the current email verification state.</p>
      <p className="muted">{filters.start} to {filters.end}, inclusive. Dates follow Cairo time.</p>
    </section>
    <section aria-labelledby="demand-filter-heading">
      <h2 id="demand-filter-heading">Choose the view</h2>
      <form action="/staff/reports" method="get" className="demand-filters">
        <fieldset><legend className="demand-sr-only">Filter the demand report</legend>
          <label>From<input type="date" name="start" defaultValue={filters.start} required/></label>
          <label>Through<input type="date" name="end" defaultValue={filters.end} required/></label>
          <label>Enquiry group<select name="cohort" defaultValue={filters.cohort}>
            <option value="customers">Customer enquiries</option><option value="verified">Verified customers</option><option value="unverified">Unverified customers</option><option value="test">Test verification only</option><option value="demo">Demo only</option><option value="all">All groups, shown separately</option>
          </select></label>
          <label>Model contains<input name="model" maxLength={120} defaultValue={filters.model} placeholder="For example, A-10"/></label>
          <label>Range contains<input name="range" maxLength={160} defaultValue={filters.range} placeholder="For example, bar"/></label>
          <label>Groups per page<select name="pageSize" defaultValue={filters.pageSize}>
            {[...new Set([25,50,100,filters.pageSize])].sort((a,b)=>a-b).map(size=><option key={size} value={size}>{size}</option>)}
          </select></label>
        </fieldset>
        <p className="muted" id="demand-filter-help">Choose up to 93 days. Model and range filters search the displayed, privacy-safe labels.</p>
        <div className="demand-actions"><button type="submit" aria-describedby="demand-filter-help">Apply filters</button><a href="/staff/reports">Reset filters</a></div>
      </form>
    </section>
    <section aria-labelledby="demand-total-heading">
      <h2 id="demand-total-heading">Saved demand</h2>
      <dl className="demand-totals"><div><dt>Enquiries</dt><dd>{number(totals.requests)}</dd></div><div><dt>Requested units</dt><dd>{number(totals.units)}</dd></div><div><dt>Verified customer enquiries</dt><dd>{number(totals.verifiedRequests)}</dd></div></dl>
      <p className="muted">Within these filters: {number(totals.unverifiedRequests)} unverified customer enquiries, {number(totals.testRequests)} test verifications, and {number(totals.demoRequests)} demo enquiries. Closed enquiries remain part of historical demand.</p>
    </section>
    <section aria-labelledby="demand-model-heading">
      <div className="demand-table-heading"><h2 id="demand-model-heading">Demand by model and range</h2>
        {report.totalRows>0&&report.totalRows<=DEMAND_EXPORT_LIMIT?<a className="button secondary" href={reportLink(filters,1,'csv')}>Download CSV</a>:null}
      </div>
      {report.totalRows>DEMAND_EXPORT_LIMIT?<p>To download CSV, narrow the filters to 2,000 groups or fewer.</p>:null}
      {report.totalRows===0?<div className="demand-empty"><h3>No saved demand in this view</h3><p>Try a wider date range or clear the model and range filters. Demo and test enquiries appear only when their group is selected.</p></div>:
        report.rows.length===0?<p>This page has no rows. <a href={reportLink(filters,1)}>Return to the first page.</a></p>:<>
          <div className="table-scroll" role="region" aria-label="Demand by model and range" tabIndex={0}>
            <table><caption>Sorted by requested units, highest first. An enquiry can appear in several rows; row request counts must not be added together.</caption><thead><tr><th scope="col">Model</th><th scope="col">Requested range</th><th scope="col">Enquiry group</th><th scope="col" className="demand-number">Requests</th><th scope="col" className="demand-number">Units</th></tr></thead>
              <tbody>{report.rows.map(row=><tr key={JSON.stringify([row.model,row.range,row.cohort])}><th scope="row"><bdi>{row.model}</bdi></th><td><bdi>{row.range}</bdi></td><td>{demandCohortLabels[row.cohort]}</td><td className="demand-number">{number(row.requests)}</td><td className="demand-number">{number(row.units)}</td></tr>)}</tbody></table>
          </div>
          <nav className="demand-pagination" aria-label="Demand report pages">
            {filters.page>1?<a href={reportLink(filters,filters.page-1)}>Previous page</a>:<span/>}
            <span>Page {filters.page} of {report.totalPages} · {number(report.totalRows)} groups</span>
            {filters.page<report.totalPages?<a href={reportLink(filters,filters.page+1)}>Next page</a>:<span/>}
          </nav>
        </>}
      <p className="muted">CSV includes every matching group, across all pages. It contains aggregate model, range, enquiry group, request and unit counts.</p>
    </section>
    <section className="demand-definitions" aria-labelledby="demand-definitions-heading"><h2 id="demand-definitions-heading">Read the numbers correctly</h2>
      <p>Verified means a customer enquiry with completed email verification and a saved verification time. Test verifications and demo requests are separate. Verification does not mean a sale, quotation acceptance or stock allocation.</p>
      <p>Catalogue model names come from the original enquiry snapshot. Direct requests appear as “Customer-specified model”. Only numeric measurement ranges are shown; other range text stays in the enquiry inbox for staff review. Similar range wording is kept separate, without conversion between units.</p>
      <p>Demand is not a stock shortage. Exact SKU selection and allocation must be reviewed in stock control. <a href="/staff/inventory">Open stock control</a> or <a href="/admin/collections/enquiries">review individual enquiries</a>.</p>
    </section>
  </>;
}
