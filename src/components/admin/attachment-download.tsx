'use client';
export function AttachmentDownload({rowData}:{rowData?:{id?:number}}){
  if(!rowData?.id)return null;
  return <a href={`/staff/files/${rowData.id}`} target="_blank" rel="noopener noreferrer">Review / download file</a>;
}
