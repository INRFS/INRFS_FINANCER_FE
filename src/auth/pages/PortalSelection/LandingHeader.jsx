import React, { useEffect, useState } from 'react';
import { Menu, ShieldCheck, X } from 'lucide-react';
import { Link } from 'react-router-dom';

import logo from '../../../assets/logo.png';

const links = [['Capabilities', 'capabilities'], ['How it works', 'workflow'], ['Benefits', 'benefits'], ['Security', 'security'], ['Pricing', 'pricing'], ['FAQ', 'faq']];

export default function LandingHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    const onKey = (event) => { if (event.key === 'Escape') setOpen(false); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('scroll', onScroll); document.removeEventListener('keydown', onKey); };
  }, []);

  const close = () => setOpen(false);

  return <header className={`landing-header ${scrolled ? 'is-scrolled' : ''}`}>
    <div className="landing-shell landing-header-inner">
      <a href="#home" className="landing-brand" onClick={close} aria-label="INRFS Financer Platform home">
        <img src={logo} alt="INRFS" />
        <span>Financer Platform</span>
      </a>
      <button type="button" className="landing-menu-toggle" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="landing-navigation" aria-label={open ? 'Close navigation' : 'Open navigation'}>{open ? <X size={22} /> : <Menu size={22} />}</button>
      <div id="landing-navigation" className={`landing-navigation ${open ? 'is-open' : ''}`}>
        <nav aria-label="Main navigation">{links.map(([label, id]) => <a key={id} href={`#${id}`} onClick={close}>{label}</a>)}</nav>
        <div className="landing-header-actions"><Link className="landing-login-link" to="/financer/login" onClick={close}>Sign In</Link><a className="landing-primary-button landing-header-cta" href="mailto:support@inrfs.in?subject=INRFS%20demo%20request" onClick={close}>Book a Demo</a></div>
      </div>
      <span className="landing-header-secure"><ShieldCheck size={15} /> Secure access</span>
    </div>
  </header>;
}
