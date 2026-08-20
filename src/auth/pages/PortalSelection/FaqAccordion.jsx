import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FaqAccordion({ items }) {
  const [openIndex, setOpenIndex] = useState(0);
  return <div className="landing-faq-list">{items.map(([question, answer], index) => {
    const open = openIndex === index;
    const buttonId = `faq-button-${index}`;
    const panelId = `faq-panel-${index}`;
    return <article key={question} className={open ? 'is-open' : ''}><h3><button id={buttonId} type="button" aria-expanded={open} aria-controls={panelId} onClick={() => setOpenIndex(open ? -1 : index)}><span>{question}</span><ChevronDown size={19} /></button></h3><div id={panelId} role="region" aria-labelledby={buttonId} hidden={!open}><p>{answer}</p></div></article>;
  })}</div>;
}
