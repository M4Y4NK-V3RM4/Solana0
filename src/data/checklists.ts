import type { Checklist } from './types';

/**
 * Practical working checklists for officials. These summarise common practice
 * under the MV Act and CMVR; state SOPs and the latest notifications prevail.
 */
export const CHECKLISTS: Checklist[] = [
  {
    id: 'chk-fitness',
    title: 'Transport vehicle fitness inspection',
    for: 'Motor Vehicles Inspector',
    basis: 'MV Act s.56; CMVR Rules 62, 104, 118, 125H',
    sections: [
      {
        heading: 'Documents',
        items: [
          'Registration certificate matches chassis and engine numbers on the vehicle',
          'Valid insurance certificate',
          'Valid PUC certificate',
          'Permit (if required) and route/area conditions',
          'Tax paid up to date',
        ],
      },
      {
        heading: 'Identification',
        items: [
          'High Security Registration Plates fitted, with snap locks and laser code intact',
          'Third registration mark (windshield sticker) present',
          'No unauthorised alteration of body, seating or dimensions',
        ],
      },
      {
        heading: 'Brakes, steering and suspension',
        items: [
          'Service brake and parking brake efficiency',
          'No air leaks (air-braked vehicles); pressure gauge working',
          'Steering free play within limits; no wear in linkages',
          'Springs, shackles and suspension mountings sound',
        ],
      },
      {
        heading: 'Lights, signals and visibility',
        items: [
          'Headlamps (high/low beam), tail, brake, reverse and number plate lamps working',
          'Direction indicators and hazard warning lamps',
          'Retro-reflective tapes: red rear, yellow sides, white front — clean and intact',
          'Rear red reflectors fitted',
          'Windscreen free of cracks; wipers and washers working',
          'Rear-view mirrors on both sides',
        ],
      },
      {
        heading: 'Tyres and wheels',
        items: [
          'Tread depth within the prescribed limit; no cuts or bulges',
          'Same size and type on each axle; no retreads on front steering axle of buses where prohibited',
          'Wheel nuts all present and tight',
        ],
      },
      {
        heading: 'Safety equipment',
        items: [
          'Speed limiting device fitted, sealed and set correctly',
          'VLTD and panic buttons fitted and live (public service vehicles registered from 1 Jan 2019)',
          'Fire extinguisher (buses and goods vehicles as prescribed)',
          'First-aid box',
          'Seat belts where required; emergency exits in buses unobstructed',
          'Horn working (no multi-tone or pressure horns)',
        ],
      },
      {
        heading: 'Emissions',
        items: ['Visible smoke check', 'Emission test within limits for the vehicle’s BS norm', 'Exhaust system not modified'],
      },
    ],
  },
  {
    id: 'chk-driving-test',
    title: 'Conducting the driving test',
    for: 'Motor Vehicles Inspector / licensing officer',
    basis: 'MV Act s.9; CMVR Rule 15',
    sections: [
      {
        heading: 'Before the test',
        items: [
          'Verify identity and the learner’s licence (held at least 30 days, still valid)',
          'Check the vehicle presented is of the class applied for and is roadworthy',
          'Confirm medical certificate where required (Form 1-A)',
        ],
      },
      {
        heading: 'Pre-drive checks by the candidate',
        items: ['Adjusts seat and mirrors', 'Wears seat belt / helmet', 'Checks surroundings before moving off'],
      },
      {
        heading: 'Vehicle control',
        items: [
          'Starts smoothly; correct gear selection',
          'Steering control and lane keeping',
          'Proper use of clutch, accelerator and brakes',
          'Hill start (where test track has a gradient)',
          'Reversing and parking (e.g. figure-of-eight for two-wheelers, parallel parking for cars)',
        ],
      },
      {
        heading: 'Road behaviour',
        items: [
          'Observes signs and signals',
          'Uses indicators and hand signals correctly',
          'Gives way to pedestrians and at junctions',
          'Keeps a safe following distance and speed',
          'Responds correctly to the examiner’s instructions',
        ],
      },
      {
        heading: 'After the test',
        items: [
          'Record result in Sarathi',
          'If failed, inform candidate they may retake after 7 days',
          'Exempt ADTC graduates as per the ADTC rules (verify certificate)',
        ],
      },
    ],
  },
  {
    id: 'chk-roadside',
    title: 'Roadside check of a vehicle',
    for: 'Traffic police / MVD enforcement',
    basis: 'MV Act ss.130, 206, 207, 213; CMVR Rule 139',
    sections: [
      {
        heading: 'Approach',
        items: [
          'Be in uniform; wear a body camera if issued',
          'Stop the vehicle at a safe place without obstructing traffic',
          'Explain the reason for the check',
        ],
      },
      {
        heading: 'Documents to verify (physical or DigiLocker/mParivahan)',
        items: ['Driving licence of the correct class', 'Registration certificate', 'Insurance', 'PUC', 'Fitness and permit for transport vehicles'],
      },
      {
        heading: 'On-the-spot checks',
        items: [
          'Helmet / seat belt use',
          'Number plate is HSRP and not tampered',
          'Signs of intoxication (use breath analyser per procedure)',
          'Overloading or excess passengers',
          'Tinted glass, pressure horns, modified silencers',
        ],
      },
      {
        heading: 'If an offence is found',
        items: [
          'Issue an e-challan through the handheld device, citing the correct section',
          'If documents are not available, allow production within 15 days (Rule 139)',
          'For s.183/184/185/189/190/194C/194D/194E, seize licence and issue acknowledgement (s.206(4))',
          'If detaining a vehicle, issue a seizure memo (s.207)',
          'Remember s.210B: officers who commit offences pay double',
        ],
      },
    ],
  },
  {
    id: 'chk-accident',
    title: 'At the scene of a road accident',
    for: 'Police / first responders',
    basis: 'MV Act ss.134, 134A, 159, 162; MACT procedure',
    sections: [
      {
        heading: 'Immediate',
        items: [
          'Secure the scene; warn approaching traffic',
          'Call 112 / 108 for ambulance; arrange transfer to the nearest hospital',
          'Do not detain or question Good Samaritans (s.134A)',
        ],
      },
      {
        heading: 'Record',
        items: [
          'Photograph positions of vehicles, skid marks and road conditions',
          'Note vehicle numbers, driver licence and insurance details',
          'Record witness statements',
          'Register FIR where required (BNS 281 / 106 as applicable)',
        ],
      },
      {
        heading: 'Follow-up',
        items: [
          'Submit First Accident Report to the Claims Tribunal within 48 hours',
          'File the Detailed Accident Report within the prescribed time',
          'Inform victims about hit-and-run compensation (s.161) and cashless treatment (s.162)',
        ],
      },
    ],
  },
];
