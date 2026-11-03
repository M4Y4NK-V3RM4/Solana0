export interface DraftTemplate {
  id: string;
  title: string;
  titleHi: string;
  audience: 'official' | 'citizen';
  /** Shown to the user: what to put in the details box. */
  hint: string;
  /** Sent to the AI: structure and contents of the document. */
  guidance: string;
}

export const DRAFT_TEMPLATES: DraftTemplate[] = [
  // ── Officials ──
  {
    id: 'seizure-memo',
    title: 'Seizure memo (vehicle detained)',
    titleHi: 'ज़ब्ती मेमो (वाहन रोका गया)',
    audience: 'official',
    hint: 'Vehicle number and type, owner/driver name, place, date and time, reason (e.g. no permit, no registration), documents seen, officer name and rank.',
    guidance:
      'A seizure / detention memo under MV Act s.207. Include: heading, memo number placeholder, date/time/place, officer details, vehicle and driver details, the provision under which the vehicle is detained and the facts, list of documents and articles seized, where the vehicle will be kept, what the owner must produce for release, signature blocks for officer and driver, and a line that a copy was given to the driver.',
  },
  {
    id: 'licence-ack',
    title: 'Acknowledgement of licence seizure',
    titleHi: 'लाइसेंस ज़ब्ती की पावती',
    audience: 'official',
    hint: 'Driver name, licence number, offence and section, date, place, officer details.',
    guidance:
      'An acknowledgement given when a driving licence is seized under MV Act s.206. State the offence and section, that the licence is being forwarded to the licensing authority, and that this acknowledgement authorises the holder to drive until the case is decided, per s.206. Include signature blocks.',
  },
  {
    id: 'mvi-accident-report',
    title: 'MVI report on an accident vehicle',
    titleHi: 'दुर्घटनाग्रस्त वाहन पर एमवीआई रिपोर्ट',
    audience: 'official',
    hint: 'FIR number and police station, vehicle number and type, date/place of inspection, what you found: brakes, steering, tyres, lights, damage, any defect that could have caused the accident.',
    guidance:
      'A Motor Vehicles Inspector’s mechanical inspection report on a vehicle involved in an accident, for the police/court. Sections: reference (FIR, police station, request letter), vehicle particulars (registration, chassis/engine numbers, type), date/place/time of inspection, condition of brakes, steering, tyres, lights and horn, body damage with location, and an opinion on whether any mechanical defect could have caused or contributed to the accident. Use neutral, factual language. Leave every measurement and finding not supplied as a placeholder.',
  },
  {
    id: 'show-cause-permit',
    title: 'Show-cause notice to a permit holder',
    titleHi: 'परमिट धारक को कारण बताओ नोटिस',
    audience: 'official',
    hint: 'Permit holder name, permit number and type, vehicle number, the violation found and when, response deadline.',
    guidance:
      'A show-cause notice from the transport authority to a permit holder for violating permit conditions (MV Act s.86 provides for suspension/cancellation of permits). State the facts, the condition breached, ask why action should not be taken, set a reply deadline placeholder, offer a hearing, and warn that the matter will be decided on the record if no reply is received.',
  },
  {
    id: 'complaint-reply',
    title: 'Reply to a public complaint',
    titleHi: 'जन शिकायत का उत्तर',
    audience: 'official',
    hint: 'What the complaint says (or scan it), its reference number, what action was taken or will be taken.',
    guidance:
      'A courteous, factual reply from the office to a member of the public about their complaint. Acknowledge the complaint and reference number, explain the legal position with the relevant provisions, state the action taken or proposed, and give the escalation route if they are not satisfied.',
  },
  {
    id: 'rti-reply',
    title: 'Reply to an RTI application',
    titleHi: 'आरटीआई आवेदन का उत्तर',
    audience: 'official',
    hint: 'Applicant name, RTI number and date received, the questions asked, and the information available for each.',
    guidance:
      'A reply by the Public Information Officer under the Right to Information Act, 2005. Answer point by point. Where information is not held or is exempt, say so and cite the provision only if supplied by the user. End with the name and address of the First Appellate Authority (placeholder) and the time limit for a first appeal under s.19(1) (30 days).',
  },
  // ── Citizens ──
  {
    id: 'challan-grievance',
    title: 'Grievance against a wrong e-challan',
    titleHi: 'गलत ई-चालान के विरुद्ध शिकायत',
    audience: 'citizen',
    hint: 'Challan number and date, your vehicle number, why it is wrong (e.g. you were elsewhere, plate cloned, vehicle sold), what evidence you have.',
    guidance:
      'A grievance to the traffic police / e-challan authority asking for a challan to be reviewed or withdrawn. Facts, why the challan is wrong, list of attached evidence (placeholders), the relief requested, and a request for written disposal. Polite and concise.',
  },
  {
    id: 'rti-application',
    title: 'RTI application to a transport or traffic office',
    titleHi: 'परिवहन / यातायात कार्यालय को आरटीआई आवेदन',
    audience: 'citizen',
    hint: 'Which office, and what information you want (e.g. status of my licence application, evidence for my challan).',
    guidance:
      'An application under s.6(1) of the Right to Information Act, 2005 to the Public Information Officer of the named office. Numbered, specific questions; applicant details as placeholders; a line about the application fee with the amount as a placeholder; and the preferred mode of reply.',
  },
  {
    id: 'notice-reply',
    title: 'Reply to a notice from the RTO or traffic police',
    titleHi: 'आरटीओ / यातायात पुलिस के नोटिस का उत्तर',
    audience: 'citizen',
    hint: 'What the notice says (or scan it), its number and date, and your side of the facts.',
    guidance:
      'A reply to an official notice. Reference the notice, respond to each allegation in order, state the relevant legal position, attach documents (placeholders), and request a hearing if needed.',
  },
  {
    id: 'misconduct-complaint',
    title: 'Complaint about a wrong fine or misconduct at a check',
    titleHi: 'गलत जुर्माने या दुर्व्यवहार की शिकायत',
    audience: 'citizen',
    hint: 'Date, time and place, what happened, officer name or badge if known, amount demanded, any receipt or challan given.',
    guidance:
      'A complaint to the senior officer of the traffic police or transport department about an incorrect fine or misconduct during a vehicle check. Factual narrative, the correct legal position, the relief sought, and a request for acknowledgement. Avoid accusations beyond the facts given.',
  },
];
