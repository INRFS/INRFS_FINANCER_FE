import React from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

import '../PortalSelection/PortalSelection.css';
import './LegalNotice.css';

export default function LegalNotice({ type }) {
  const privacy = type === 'privacy';
  const title = privacy ? 'Privacy Policy' : 'Terms of Use';

  return <main className="legal-page">
    <div className="legal-card">
      <Link to="/"><ArrowLeft size={16} /> Back to INRFS</Link>
      <span className="legal-icon"><FileText size={24} /></span>
      <p className="legal-label">LEGAL INFORMATION</p>
      <h1>{title}</h1>
      <p className="legal-status">Draft placeholder — replace with content reviewed and approved by your legal adviser before public launch.</p>
      <section>
        <h2>{privacy ? 'How information is handled' : 'Using the platform'}</h2>
        <p>{privacy
          ? 'INRFS processes account and operational information required to provide its financer workflows. The final policy should identify the data controller, retention periods, subprocessors, user rights, and applicable contact details.'
          : 'Access to INRFS is intended for authorized users operating within their assigned role. The final terms should define account responsibilities, acceptable use, service availability, fees, limitations, and dispute handling.'}</p>
      </section>
      <section><h2>Questions</h2><p>Contact <a href="mailto:support@inrfs.in">support@inrfs.in</a> for platform-related enquiries.</p></section>
    </div>
  </main>;
}
