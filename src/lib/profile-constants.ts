/** Plain constants shared by the app and the server (no React or storage imports). */

export const OFFICIAL_TYPES: { id: 'mvi' | 'police' | 'rto' | 'other'; label: string; labelHi: string }[] = [
  { id: 'mvi', label: 'Motor Vehicles Inspector', labelHi: 'मोटर वाहन निरीक्षक' },
  { id: 'police', label: 'Traffic police', labelHi: 'यातायात पुलिस' },
  { id: 'rto', label: 'RTO / transport office staff', labelHi: 'आरटीओ / परिवहन कार्यालय' },
  { id: 'other', label: 'Other official', labelHi: 'अन्य अधिकारी' },
];

/** Vehicle registration codes, used to tag state-specific records. */
export const STATE_CODES: Record<string, string> = {
  'Andaman and Nicobar Islands': 'AN', 'Andhra Pradesh': 'AP', 'Arunachal Pradesh': 'AR', Assam: 'AS', Bihar: 'BR',
  Chandigarh: 'CH', Chhattisgarh: 'CG', 'Dadra and Nagar Haveli and Daman and Diu': 'DD', Delhi: 'DL', Goa: 'GA',
  Gujarat: 'GJ', Haryana: 'HR', 'Himachal Pradesh': 'HP', 'Jammu and Kashmir': 'JK', Jharkhand: 'JH', Karnataka: 'KA',
  Kerala: 'KL', Ladakh: 'LA', Lakshadweep: 'LD', 'Madhya Pradesh': 'MP', Maharashtra: 'MH', Manipur: 'MN',
  Meghalaya: 'ML', Mizoram: 'MZ', Nagaland: 'NL', Odisha: 'OD', Puducherry: 'PY', Punjab: 'PB', Rajasthan: 'RJ',
  Sikkim: 'SK', 'Tamil Nadu': 'TN', Telangana: 'TS', Tripura: 'TR', 'Uttar Pradesh': 'UP', Uttarakhand: 'UK',
  'West Bengal': 'WB',
};

/** RoadNyay launches in Delhi; other states get central law until their data is imported. */
export const LAUNCH_STATE = 'Delhi';


export const STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh',
  'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry',
  'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
  'West Bengal',
];
