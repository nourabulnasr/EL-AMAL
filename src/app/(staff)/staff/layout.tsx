import type {ReactNode} from 'react';
import {Manrope,Newsreader} from 'next/font/google';
import './staff.css';
const sans=Manrope({subsets:['latin'],variable:'--font-sans',display:'swap'});
const display=Newsreader({subsets:['latin'],variable:'--font-display',display:'swap'});
export const metadata={title:'Staff workspace | EL AMAL',robots:{index:false,follow:false}};
export default function StaffLayout({children}:{children:ReactNode}){
  return <html lang="en" className={`${sans.variable} ${display.variable}`}><body><a className="skip-link" href="#main">Skip to staff workspace</a><header className="staff-header"><a href="/admin">EL AMAL</a><nav aria-label="Staff navigation"><a href="/admin">Administration</a><a href="/staff/inventory">Stock control</a><a href="/staff/reports">Demand reports</a><a href="/staff/products">Product interest</a><a href="/admin/collections/skus">SKU definitions</a><a href="/admin/collections/enquiries">Enquiries</a></nav></header><main id="main">{children}</main></body></html>;
}
