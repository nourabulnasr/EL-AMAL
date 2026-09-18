import type {ReactNode} from 'react';
import type {ServerFunctionClient} from 'payload';
import {cmsEnabled} from '@/lib/cms-runtime';
import {importMap} from './admin/importMap';
import '@payloadcms/next/css';

const serverFunction:ServerFunctionClient = async args => {
  'use server';
  if (!cmsEnabled()) throw new Error('Administration unavailable');
  const [{handleServerFunctions},{default:config}] = await Promise.all([import('@payloadcms/next/layouts'),import('@/payload.config')]);
  return handleServerFunctions({...args,config,importMap});
};
export default async function Layout({children}:{children:ReactNode}) {
  if (!cmsEnabled()) return <html lang="en"><body>{children}</body></html>;
  const [{RootLayout},{default:config}] = await Promise.all([import('@payloadcms/next/layouts'),import('@/payload.config')]);
  return RootLayout({children,config,importMap,serverFunction});
}
