import {cmsEnabled} from '../src/lib/cms-runtime.ts';
import {mailReadiness} from '../src/lib/mail-transport.ts';
import {businessContact} from '../src/lib/business-contact.ts';
const contact=businessContact();
const report={cms:cmsEnabled(),mail:mailReadiness(),publicContact:{phone:!!contact.phone,whatsapp:!!contact.whatsapp},wikaEvidenceConfigured:!!process.env.WIKA_RELATIONSHIP_EN&&!!process.env.WIKA_RELATIONSHIP_AR&&!!process.env.WIKA_EVIDENCE_URL,catalogueMode:process.env.CATALOGUE_SOURCE==='cms'?'cms':'demo',publicSubmissionEnabled:false};
console.log(JSON.stringify(report,null,2));
console.log('Configuration presence only: this does not verify sender ownership, evidence, email receipt or launch approval. No network requests or messages were sent.');
