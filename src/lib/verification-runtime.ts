import {cmsEnabled} from './cms-runtime';
import {verificationHandlers} from './verification-http';
import {requestLimitKey,allowRequest} from './request-limits';
import {issueVerification,confirmVerification} from './enquiry-verification';
async function cms(){const [{getPayload},{default:config}]=await Promise.all([import('payload'),import('@/payload.config')]);return getPayload({config});}
export const handlers=verificationHandlers({enabled:()=>cmsEnabled(),
 authenticate:async headers=>(await(await cms()).auth({headers})).user,
 allow:async(headers,scope)=>allowRequest(await cms(),requestLimitKey(headers,scope)),
 // This HTTP issuer is strictly for demo requests. Customer issuance is server-only.
 issue:async reference=>issueVerification(await cms(),reference,'demo'),
 confirm:async token=>confirmVerification(await cms(),token),
});
