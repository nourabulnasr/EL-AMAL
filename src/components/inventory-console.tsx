'use client';
import {useCallback,useEffect,useRef,useState,type FormEvent} from 'react';
import type {InventoryView} from '@/lib/inventory-service';
import type {InventoryCommand,InventoryKind} from '@/lib/inventory';

const labels:Record<InventoryKind,string>={receipt:'Record receipt',adjustment:'Record adjustment',hold:'Create hold',release:'Release hold',dispatch:'Dispatch hold',reconcile:'Reconcile ledger',block:'Block stock',unblock:'Unblock stock',confirm:'Confirm physical count'};
const roleActions:Record<string,InventoryKind[]>={owner:['receipt','adjustment','hold','release','dispatch','block','unblock','confirm','reconcile'],sales:['hold','release','reconcile'],warehouse:['receipt','adjustment','dispatch','block','unblock','confirm','reconcile']};
export function InventoryConsole({actorId}:{actorId:number}){
  const [view,setView]=useState<InventoryView|null>(null),[skuId,setSkuId]=useState(''),[skuSearch,setSkuSearch]=useState(''),[enquirySearch,setEnquirySearch]=useState('');
  const [kind,setKind]=useState<InventoryKind>('reconcile'),[quantity,setQuantity]=useState(''),[enquiryId,setEnquiryId]=useState(''),[lineId,setLineId]=useState(''),[expiresAt,setExpiresAt]=useState(''),[reservationId,setReservationId]=useState(''),[reason,setReason]=useState('');
  const [message,setMessage]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false),[loading,setLoading]=useState(false),[ready,setReady]=useState(false),[pending,setPending]=useState<InventoryCommand|null>(null);
  const storageKey=`el-amal-inventory-pending-${actorId}`;const requestSequence=useRef(0);
  const load=useCallback(async()=>{
    const sequence=++requestSequence.current;setLoading(true);
    try{
      const query=new URLSearchParams({skuId,skuSearch,enquirySearch});
      const response=await fetch(`/api/staff/inventory?${query}`,{cache:'no-store'});const data=await response.json();
      if(!response.ok)throw new Error(data.error||'Stock data could not be loaded');
      if(sequence===requestSequence.current)setView(data);
    }catch(e){if(sequence===requestSequence.current){setView(null);setError(e instanceof Error?e.message:'Stock data could not be loaded');}}
    finally{if(sequence===requestSequence.current)setLoading(false);}
  },[skuId,skuSearch,enquirySearch]);
  useEffect(()=>{const timer=setTimeout(()=>{void load();},200);return()=>clearTimeout(timer);},[load]);
  useEffect(()=>{
    try{const saved=sessionStorage.getItem(storageKey);if(saved){const command=JSON.parse(saved);if(command&&typeof command.requestKey==='string'&&typeof command.kind==='string'){setPending(command);setSkuId(String(command.skuId));setMessage('An unfinished stock action was recovered. Retry it unchanged to confirm its result.');}}}catch{/* Storage may be unavailable; the in-memory request remains retryable. */}
    setReady(true);
  },[storageKey]);
  function remember(command:InventoryCommand|null){setPending(command);try{if(command)sessionStorage.setItem(storageKey,JSON.stringify(command));else sessionStorage.removeItem(storageKey);}catch{/* Private browsing may disable storage. */}}
  async function send(command:InventoryCommand){
    setBusy(true);setMessage('');setError('');remember(command);
    try{
      const response=await fetch('/api/staff/inventory',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(command)});
      const data=await response.json();
      if(!response.ok){
        // 4xx means the transaction was rejected. 5xx/network failures may have committed.
        if(response.status<500)remember(null);
        throw new Error(data.error||'The stock action could not be confirmed');
      }
      remember(null);setReason('');setQuantity('');setReservationId('');
      setMessage(`${labels[command.kind]} saved${data.repeated?' previously; no duplicate was created':''}. Audit entry ${data.movementId}.`);
      await load();
    }catch(e){setError(e instanceof Error?e.message:'The result is uncertain. Retry this action unchanged.');}
    finally{setBusy(false);}
  }
  function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();if(pending||busy)return;
    const command:InventoryCommand={kind,requestKey:crypto.randomUUID(),skuId:Number(skuId),reason};
    if(['receipt','adjustment','hold','release','dispatch','block','unblock','confirm'].includes(kind))command.quantity=Number(quantity);
    if(kind==='hold'){
      if(!expiresAt||!Number.isFinite(Date.parse(expiresAt))){setError('Choose a valid hold expiry');return;}
      command.enquiryId=Number(enquiryId);command.enquiryLineId=lineId;command.expiresAt=new Date(expiresAt).toISOString();
    }
    if(kind==='release'||kind==='dispatch')command.reservationId=Number(reservationId);
    void send(command);
  }
  const sku=view?.skus.find(s=>s.id===Number(skuId));const enquiry=view?.enquiries.find(e=>e.id===Number(enquiryId));
  const actions=roleActions[view?.role||'']||[];const balance=view?.balance;const freshness=view?.freshness;
  const selectedReservation=view?.reservations.find(r=>r.id===Number(reservationId));
  return <>
    <section className="stock-heading"><h1>Stock control</h1><p>Record physical receipts, allocate exact configurations and keep every stock change traceable.</p><p className="muted">Quantities begin at zero. Catalogue availability never creates a stock balance.</p></section>
    <div aria-live="polite" className="stock-notices">{message&&<p role="status">{message}</p>}{error&&<p role="alert">{error}</p>}</div>
    {pending&&<section className="pending-action"><h2>Confirm an unfinished action</h2><p>{labels[pending.kind]} · SKU {pending.skuId}{pending.quantity!==undefined?` · Quantity ${pending.quantity}`:''}</p><p>{pending.reason}</p><p>The original details and request key are retained. Retrying confirms the result without recording a second action.</p><button disabled={busy} onClick={()=>void send(pending)}>{busy?'Confirming…':'Retry original action'}</button></section>}
    <section className="stock-selector" aria-busy={loading}><h2>Choose the exact SKU</h2><fieldset disabled={!!pending||busy}>
      <label>Find a SKU or model<input value={skuSearch} maxLength={120} onChange={event=>setSkuSearch(event.target.value)} placeholder="Search by SKU code or model"/></label>
      <label>SKU<select value={skuId} onChange={event=>{setSkuId(event.target.value);setReservationId('');setView(current=>current?{...current,balance:null,reservations:[],movements:[]}:null);}}><option value="">Choose a SKU</option>{view?.skus.map(s=><option key={s.id} value={s.id}>{s.skuCode} — {s.model}{s.active?'':' (inactive)'}</option>)}</select></label>
    </fieldset>{view?.skus.length===0&&<p>No matching SKUs. The owner must create a real SKU definition before stock can be recorded.</p>}<p className="muted">Up to 100 matching SKUs. Refine the search for older or less common configurations.</p>
    {sku&&<details><summary>Review configuration for {sku.skuCode}</summary><pre>{JSON.stringify(sku.configuration,null,2)}</pre></details>}
    </section>
    {balance&&<section className="stock-balance" aria-label="Current stock balance"><dl><div><dt>On hand</dt><dd>{balance.onHand}</dd></div><div><dt>Held</dt><dd>{balance.reserved}</dd></div><div><dt>Blocked</dt><dd>{balance.blocked}</dd></div><div><dt>Available</dt><dd>{balance.available}</dd></div></dl><p>{balance.consistent?'Ledger and reservation totals agree.':'Ledger totals disagree. Ask the owner to investigate before recording another action.'}</p>{balance.expiredPending>0&&<p>{balance.expiredPending} expired units are available; their expiry audit entries will be recorded by reconciliation or the worker.</p>}
      {freshness&&<div><h2>Physical count review</h2><p>{freshness.confirmedAt?`Last confirmed: ${new Date(freshness.confirmedAt).toLocaleString()}.`:'No physical count has been confirmed.'}</p><p>{freshness.status==='policy-unset'?'The freshness interval has not been configured. Review physical stock before allocating; the owner must choose the operating policy.':freshness.status==='policy-invalid'?'The freshness policy is invalid. Ask the owner to correct its configuration before creating holds.':freshness.status==='fresh'?`The count was confirmed within the configured ${freshness.thresholdHours}-hour interval.`:'A current physical count is required from the owner or warehouse before a new hold can be created.'}</p></div>}
      <button className="secondary" disabled={busy||loading} onClick={()=>void load()}>Refresh balance</button></section>}
    {skuId&&balance&&<section className="stock-action"><h2>Record a stock action</h2><form onSubmit={submit}><fieldset disabled={busy||!!pending||!ready||loading||!balance.consistent}>
      <label>Action<select value={kind} onChange={event=>{setKind(event.target.value as InventoryKind);setQuantity('');setReservationId('');}}>{actions.map(action=><option key={action} value={action}>{labels[action]}</option>)}</select></label>
      {['receipt','adjustment','hold','release','dispatch','block','unblock','confirm'].includes(kind)&&<label>{kind==='adjustment'?'Signed change (use a negative number for a reduction)':kind==='confirm'?'Physical on-hand count':kind==='dispatch'?'Quantity to dispatch':kind==='release'?'Quantity to release':'Quantity'}<input type="number" step="1" min={kind==='adjustment'?-999999:kind==='confirm'?0:1} max={kind==='confirm'?999999999:(kind==='dispatch'||kind==='release')&&selectedReservation?selectedReservation.remainingQuantity:999999} required value={quantity} onChange={event=>setQuantity(event.target.value)}/></label>}
      {kind==='hold'&&<>
        <label>Find a verified enquiry<input maxLength={120} value={enquirySearch} onChange={event=>setEnquirySearch(event.target.value)} placeholder="Enquiry reference"/></label>
        <label>Verified enquiry<select required value={enquiryId} onChange={event=>{setEnquiryId(event.target.value);setLineId('');}}><option value="">Choose an enquiry</option>{view?.enquiries.map(e=><option key={e.id} value={e.id}>{e.reference}</option>)}</select></label>
        <label>Requested line<select required value={lineId} onChange={event=>setLineId(event.target.value)}><option value="">Choose the matching line</option>{(enquiry?.items??[]).map(line=><option key={line.id} value={line.id}>{line.model} · requested {line.quantity}{line.range?` · ${line.range}`:''}</option>)}</select></label>
        <label>Hold expires (your local time)<input type="datetime-local" required value={expiresAt} onChange={event=>setExpiresAt(event.target.value)}/></label><p className="muted">Choose the agreed expiry within 30 days. Review the exact SKU configuration against the customer’s requested range before creating a hold.</p>
      </>}
      {(kind==='release'||kind==='dispatch')&&<><label>Active reservation<select required value={reservationId} onChange={event=>{setReservationId(event.target.value);setQuantity('');}}><option value="">Choose a hold</option>{view?.reservations.filter(r=>r.status==='held').map(r=><option key={r.id} value={r.id}>{r.reference} · {r.remainingQuantity} units remaining · {r.enquiryReference}</option>)}</select></label><p>Enter the units actually {kind==='dispatch'?'shipped':'released'}. The rest remain held until the original expiry.{kind==='dispatch'?' Include the dispatch document number in the reason.':''}</p></>}
      {kind==='block'&&<p>Move available units into blocked stock, for example during a documented inspection. Units remain on hand and cannot be allocated.</p>}
      {kind==='unblock'&&<p>Return the entered blocked quantity to available stock. Include the inspection or release reference in the reason.</p>}
      {kind==='confirm'&&<p>Count all on-hand units, including held and blocked units. The count must match the ledger. Investigate a mismatch and record a documented adjustment before confirming.</p>}
      {kind==='reconcile'&&<p>Checks the stock ledger against open holds and records due expirations. It does not change a physical balance to hide a discrepancy.</p>}
      <label>Reason or supporting document reference<textarea required maxLength={1000} value={reason} onChange={event=>setReason(event.target.value)} rows={3}/></label>
      <button type="submit">{busy?'Saving…':labels[kind]}</button>
    </fieldset></form></section>}
    {balance&&<section><h2>Reservations</h2><p className="muted">Latest 100 reservations, with active holds first. State describes the remaining hold; shipment totals remain visible after release or expiry.</p><div className="table-scroll" tabIndex={0} role="region" aria-label="Reservations table"><table><thead><tr><th>Reference</th><th>Original</th><th>Still held</th><th>Dispatched</th><th>Released</th><th>Expired</th><th>State</th><th>Expires</th><th>Enquiry</th><th>Configuration at hold</th></tr></thead><tbody>{view?.reservations.map(r=><tr key={r.id}><td>{r.reference}</td><td>{r.quantity}</td><td>{r.remainingQuantity}</td><td>{r.dispatchedQuantity}</td><td>{r.releasedQuantity}</td><td>{r.expiredQuantity}</td><td>{r.status==='dispatch'?'Dispatched':r.status==='release'?'Released':['expire','expired'].includes(r.status)?'Expired':'Held'}</td><td>{new Date(r.expiresAt).toLocaleString()}</td><td>{r.enquiryReference}</td><td><details><summary>View snapshot</summary><pre>{JSON.stringify(r.skuSnapshot,null,2)}</pre></details></td></tr>)}</tbody></table></div>{!view?.reservations.length&&<p>No reservations for this SKU.</p>}</section>}
    {balance&&<section><h2>Stock audit trail</h2><p className="muted">Latest 100 entries. Corrections are new reasoned adjustments; previous entries remain unchanged.</p><div className="table-scroll" tabIndex={0} role="region" aria-label="Stock audit table"><table><thead><tr><th>Time</th><th>Action</th><th>On-hand change</th><th>Held change</th><th>Blocked change</th><th>Physical count</th><th>Actor</th><th>Reason</th></tr></thead><tbody>{view?.movements.map(m=><tr key={m.id}><td>{new Date(m.createdAt).toLocaleString()}</td><td>{m.kind}</td><td>{m.onHandDelta}</td><td>{m.reservedDelta}</td><td>{m.blockedDelta}</td><td>{m.confirmedQuantity??'—'}</td><td>{m.actorRole}{m.actorId?` #${m.actorId}`:''}</td><td>{m.reason}</td></tr>)}</tbody></table></div>{!view?.movements.length&&<p>No stock has been recorded for this SKU.</p>}</section>}
  </>;
}
