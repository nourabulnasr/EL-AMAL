export type EnquiryDetails={name:string;email:string;company:string;notes:string};
export function validateEnquiry(details:EnquiryDetails):Partial<Record<keyof EnquiryDetails,boolean>> {
 const errors:Partial<Record<keyof EnquiryDetails,boolean>>={};
 if(!details.name.trim()||details.name.length>120)errors.name=true;
 if(!details.company.trim()||details.company.length>160)errors.company=true;
 if(details.email.length>254||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email.trim()))errors.email=true;
 if(details.notes.length>2000)errors.notes=true;
 return errors;
}
