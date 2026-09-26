export interface AgraSafetyZone {
  id: string
  name: string
  subAreaName?: string
  category: 'university' | 'monument' | 'market' | 'nature' | 'transport' | 'residential' | 'sports' | 'hostel'
  type: 'safe' | 'caution' | 'danger'
  safetyLevel: number // 1 to 10 (10 = highest safety)
  center: { lat: number; lng: number }
  radius: number // meters
  polygon?: Array<{ lat: number; lng: number }>
  address: string
  landmark: string
  city: string
  state: string
  pincode: string
  description: string
  riskFactors: string[]
  safetyGuidelines: string[]
  facilities: string[]
  emergencyContacts: {
    police: string
    medical: string
    campusSecurity?: string
    wardenDesk?: string
    touristHelpline: string
  }
  activeHours: { start: string; end: string }
  isSurveillanceActive: boolean
  lastAuditDate: string
}

export const SHARDA_AGRA_ZONES: AgraSafetyZone[] = [
  // 1. SUA: SHARDA UNIVERSITY AGRA - MAIN ACADEMIC & ADMIN CAMPUS (ANAND ENGINEERING COLLEGE)
  {
    id: 'sua-academic-core',
    name: 'SUA: Sharda University Agra (Anand Engineering College Campus)',
    subAreaName: 'Central Academic Blocks, Tech Hub & Central Library',
    category: 'university',
    type: 'safe',
    safetyLevel: 9,
    center: { lat: 27.2481, lng: 77.8345 },
    radius: 350,
    polygon: [
      { lat: 27.2515, lng: 77.8320 },
      { lat: 27.2520, lng: 77.8375 },
      { lat: 27.2445, lng: 77.8380 },
      { lat: 27.2440, lng: 77.8325 }
    ],
    address: 'SUA: Sharda University Agra / Anand Engineering College (AEC), 19th Km Milestone, Agra-Delhi Highway (NH-19), Keetham, Agra, Uttar Pradesh 282007',
    landmark: '19th Km Milestone NH-19, Central Academic Square, Keetham',
    city: 'Agra',
    state: 'Uttar Pradesh',
    pincode: '282007',
    description: 'Premier university and engineering campus combining SUA (Sharda University Agra) and Anand Engineering College across 60+ acres, with 24/7 security control, CCTV perimeter, lecture halls, and medical clinics.',
    riskFactors: [
      'Heavy student traffic during lecture change intervals',
      'Restricted access to server rooms and high-voltage electrical panels'
    ],
    safetyGuidelines: [
      'Carry your SUA / AEC Digital Student/Visitor ID for security checkpoint verification',
      'Follow campus emergency evacuation routes and corridor maps',
      'Emergency SOS call points located at the ground floor entrance of every block'
    ],
    facilities: [
      '24/7 Campus Security Control Desk',
      'Full Indoor & Outdoor CCTV Coverage',
      'SUA Campus Ambulance & Medical Clinic',
      'Central RO Drinking Water Stations',
      'Campus-wide Wi-Fi & Fire Hydrant Grid'
    ],
    emergencyContacts: {
      police: '112',
      medical: '108',
      campusSecurity: '+91 5613 272026',
      touristHelpline: '1363'
    },
    activeHours: { start: '00:00', end: '23:59' },
    isSurveillanceActive: true,
    lastAuditDate: '2026-02-21'
  },

  // 2. SUA: MAIN ENTRANCE GATE & NH-19 HIGHWAY CORRIDOR (ANAND CAMPUS FRONTAGE)
  {
    id: 'sua-main-gate-highway',
    name: 'SUA: Main Gate & NH-19 Highway Service Corridor',
    subAreaName: 'AEC Main Gate, Bus Terminal & Visitor Checkpoint',
    category: 'transport',
    type: 'caution',
    safetyLevel: 6,
    center: { lat: 27.2512, lng: 77.8335 },
    radius: 200,
    address: 'SUA Front Gate, NH-19 Agra-Mathura Highway, Anand Campus, Keetham, Agra',
    landmark: 'Main Highway Arch Gate on NH-19 Expressway',
    city: 'Agra',
    state: 'Uttar Pradesh',
    pincode: '282007',
    description: 'Front gate vehicular checkpost, visitor parking, student bus boarding bays, and NH-19 highway access service road. High-speed highway transit nearby.',
    riskFactors: [
      'Fast-moving heavy commercial trucks on NH-19 Agra-Delhi highway',
      'Blind spots near heavy vehicle turning lanes',
      'Unauthorized auto-rickshaws on highway shoulder'
    ],
    safetyGuidelines: [
      'Strictly use designated zebra crossing and speed-breaker zones to access highway lane',
      'Do not board unverified private vehicles; use SafePath Driver Booking or college transit buses',
      'Report any unauthorized persons at the gate to the Armed Security Guard post'
    ],
    facilities: [
      'Armed Main Gate Security Booth',
      'Automatic Boom Barriers & ANPR License Plate Cameras',
      'Visitor Registration Kiosk',
      'Shaded Bus Waiting Bay'
    ],
    emergencyContacts: {
      police: '112',
      medical: '108',
      campusSecurity: '+91 5613 272026',
      touristHelpline: '1363'
    },
    activeHours: { start: '00:00', end: '23:59' },
    isSurveillanceActive: true,
    lastAuditDate: '2026-02-21'
  },

  // 3. SUA: ANAND GIRLS HOSTEL & FACULTY RESIDENCES (TIER-1 PROTECTED ZONE)
  {
    id: 'sua-girls-hostel',
    name: 'SUA: Anand Girls Hostel & Faculty Residential Enclave',
    subAreaName: 'Mata Saraswati Girls Hostel & Faculty Quarters',
    category: 'hostel',
    type: 'safe',
    safetyLevel: 10,
    center: { lat: 27.2470, lng: 77.8375 },
    radius: 200,
    address: 'Girls Residential Enclave, South-East Sector, SUA Anand Campus, Keetham, Agra',
    landmark: 'Behind Saraswati Statue & Faculty Residences',
    city: 'Agra',
    state: 'Uttar Pradesh',
    pincode: '282007',
    description: 'Tier-1 protected residential enclave with high boundary wall, dedicated round-the-clock female security personnel, biometric entry turnstiles, and direct SOS alarm hotline.',
    riskFactors: [
      'Strictly restricted entry for unauthorized visitors and non-residents',
      'Curfew check-in protocols enforced after 7:30 PM'
    ],
    safetyGuidelines: [
      'Biometric fingerprint/face scan mandatory for entry at all times',
      'Visitor register log and warden approval required for non-resident entry',
      'Direct panic buttons installed in all common rooms connecting to Security Control'
    ],
    facilities: [
      '24/7 Dedicated Female Security Staff & Warden Office',
      'Biometric Access Control & CCTV Perimeter Sensors',
      'Indoor Medical Dispensary & Emergency Oxygen Support',
      'Safe Dining Hall & Gymnasium'
    ],
    emergencyContacts: {
      police: '112',
      medical: '108',
      campusSecurity: '+91 5613 272028',
      wardenDesk: '+91 5613 272030',
      touristHelpline: '1363'
    },
    activeHours: { start: '00:00', end: '23:59' },
    isSurveillanceActive: true,
    lastAuditDate: '2026-02-21'
  },

  // 4. SUA: ANAND BOYS HOSTELS & STUDENT MESS ENCLAVE
  {
    id: 'sua-boys-hostel',
    name: 'SUA: Anand Boys Hostels & Central Dining Complex',
    subAreaName: 'Hostels A, B, C & Central Mess Food Court',
    category: 'hostel',
    type: 'safe',
    safetyLevel: 8,
    center: { lat: 27.2450, lng: 77.8355 },
    radius: 280,
    address: 'Boys Residential Sector, South Campus, SUA Anand Campus, Keetham, Agra',
    landmark: 'Opposite Student Activity Center & Cafeteria',
    city: 'Agra',
    state: 'Uttar Pradesh',
    pincode: '282007',
    description: 'Multi-block residential zone for students with security checkpoints, night warden patrols, student dining halls, and sports recreation lounges.',
    riskFactors: [
      'Dimly lit pathways connecting to the sports grounds after 10:00 PM',
      'Night-time movement restricted beyond the outer boundary perimeter'
    ],
    safetyGuidelines: [
      'Adhere to the 9:30 PM hostel check-in biometric register',
      'Use main paved pathways with overhead streetlights during late hours',
      'Report any ragging or misconduct immediately to Anti-Ragging Cell'
    ],
    facilities: [
      '24/7 Security Guard Posts at each hostel block',
      'Central Student Mess & Night Canteen',
      'CCTV Monitoring on All Stairwells and Corridors',
      'First Aid Kit & Emergency Vehicle on Standby'
    ],
    emergencyContacts: {
      police: '112',
      medical: '108',
      campusSecurity: '+91 5613 272026',
      wardenDesk: '+91 5613 272031',
      touristHelpline: '1363'
    },
    activeHours: { start: '05:00', end: '23:00' },
    isSurveillanceActive: true,
    lastAuditDate: '2026-02-21'
  },

  // 5. SUA: ANAND SPORTS STADIUM & ATHLETICS COMPLEX
  {
    id: 'sua-sports-complex',
    name: 'SUA: Anand Sports Stadium & Athletic Grounds',
    subAreaName: 'Cricket Stadium, Football Arena & Outdoor Courts',
    category: 'sports',
    type: 'safe',
    safetyLevel: 8,
    center: { lat: 27.2440, lng: 77.8335 },
    radius: 260,
    address: 'South-West Perimeter, SUA Anand Campus, Keetham, Agra',
    landmark: 'Adjacent to Keetham Reserve Boundary Wall',
    city: 'Agra',
    state: 'Uttar Pradesh',
    pincode: '282007',
    description: 'Sprawling athletic facility with full-size cricket ground, football field, basketball and tennis courts, surrounded by perimeter security fencing.',
    riskFactors: [
      'High heat exposure during summer midday hours (11:00 AM - 4:00 PM)',
      'Isolated perimeter near boundary wall during nighttime hours after 9:00 PM'
    ],
    safetyGuidelines: [
      'Stay hydrated and avoid prolonged midday sun exposure during peak summer',
      'Avoid visiting the far outfield boundary alone after sunset',
      'Use the illuminated indoor sports complex for evening activities'
    ],
    facilities: [
      'Floodlit Basketball & Badminton Courts',
      'Drinking Water Dispensers & Shaded Dugouts',
      'Sports Injury First Aid Station',
      'Perimeter Security Patrols'
    ],
    emergencyContacts: {
      police: '112',
      medical: '108',
      campusSecurity: '+91 5613 272026',
      touristHelpline: '1363'
    },
    activeHours: { start: '05:30', end: '21:30' },
    isSurveillanceActive: true,
    lastAuditDate: '2026-02-21'
  },

  // 6. SUA: MECHANICAL WORKSHOPS & INNOVATION HANGAR
  {
    id: 'sua-workshops-innovation',
    name: 'SUA: Mechanical Workshops & Technology Labs',
    subAreaName: 'Heavy Machine Labs, CNC Center & Automobile Testing Hangar',
    category: 'university',
    type: 'safe',
    safetyLevel: 8,
    center: { lat: 27.2490, lng: 77.8320 },
    radius: 180,
    address: 'West Sector Workshops, SUA Anand Campus, Keetham, Agra',
    landmark: 'Behind Mechanical Block, West Campus Road',
    city: 'Agra',
    state: 'Uttar Pradesh',
    pincode: '282007',
    description: 'Industrial-grade engineering workshops, manufacturing labs, robotics centers, and high-voltage testing hangars with certified industrial safety protocols.',
    riskFactors: [
      'Operating heavy CNC machinery, lathes, and high-temperature welding tools',
      'High-voltage electrical installations and pressurized pneumatics'
    ],
    safetyGuidelines: [
      'Mandatory PPE: Safety goggles, closed shoes, and aprons in workshop bays',
      'Operate machinery only under qualified lab instructor supervision',
      'Know location of emergency power shutoff buttons and fire extinguishers'
    ],
    facilities: [
      'Industrial Fire Hydrant & CO2 Extinguisher Network',
      'Emergency Eye-Wash Stations',
      'First Aid Response Station',
      'Instructor Supervision Desks'
    ],
    emergencyContacts: {
      police: '112',
      medical: '108',
      campusSecurity: '+91 5613 272026',
      touristHelpline: '1363'
    },
    activeHours: { start: '08:30', end: '18:00' },
    isSurveillanceActive: true,
    lastAuditDate: '2026-02-21'
  },

  // 7. SUR SAROVAR (KEETHAM LAKE) RESERVE FOREST PERIMETER (EAST OF SUA CAMPUS)
  {
    id: 'keetham-lake-danger',
    name: 'Sur Sarovar (Keetham Lake) Reserve Forest Perimeter',
    subAreaName: 'Keetham Bird Sanctuary Wetland & Bear Rescue Perimeter (East of SUA)',
    category: 'nature',
    type: 'danger',
    safetyLevel: 2,
    center: { lat: 27.2510, lng: 77.8420 },
    radius: 650,
    address: 'Sur Sarovar Bird Sanctuary & Keetham Lake Forest Belt, East of SUA Anand Campus, Agra',
    landmark: 'East Boundary across NH-19 Keetham Exit',
    city: 'Agra',
    state: 'Uttar Pradesh',
    pincode: '282007',
    description: 'Protected national wetland ecosystem and dense reserve forest. High biodiversity with presence of wild animals (pythons, jackals, migratory bird habitats). Highly unlit and unsafe for solo tourists after dark.',
    riskFactors: [
      'Zero artificial lighting and poor cellular connectivity in deep forest trails',
      'Wildlife encounters (snakes, jackals, feral canines)',
      'Marshy terrain with drowning risk near unbarricaded lake water edges',
      'Restricted area under Wildlife Protection Act after 5:30 PM'
    ],
    safetyGuidelines: [
      'DO NOT enter forest trails after 5:30 PM under any circumstances',
      'Travel strictly in authorized tourist groups during daylight hours with forest guides',
      'If lost, activate the SafePath SOS button immediately and head West toward the SUA / NH-19 Highway lights'
    ],
    facilities: [
      'Forest Ranger Checkpoint (Daytime Only)',
      'Bear Rescue Facility Entry Point Nearby'
    ],
    emergencyContacts: {
      police: '112',
      medical: '108',
      touristHelpline: '1363'
    },
    activeHours: { start: '08:00', end: '17:30' },
    isSurveillanceActive: false,
    lastAuditDate: '2026-02-21'
  },

  // 8. KEETHAM RAILWAY STATION & VILLAGE APPROACH ROAD (WEST OF SUA CAMPUS)
  {
    id: 'keetham-station-approach',
    name: 'Keetham Railway Station & Rural Approach Road',
    subAreaName: 'Keetham Railway Crossing & Western Rural Transit Lane (West of SUA)',
    category: 'transport',
    type: 'caution',
    safetyLevel: 5,
    center: { lat: 27.2430, lng: 77.8280 },
    radius: 350,
    address: 'Keetham Railway Station Road, West of SUA Anand Campus, Keetham, Agra',
    landmark: 'Keetham Railway Crossing, 1 km West of College',
    city: 'Agra',
    state: 'Uttar Pradesh',
    pincode: '282007',
    description: 'Local rural railway station and connecting village roads providing passenger train access to Agra and Mathura. Sparsely lit at night.',
    riskFactors: [
      'Unmanned and semi-manned railway crossings with intermittent train movement',
      'Sparse street lighting and isolated road stretches after sunset',
      'Absence of regular police patrol cars on rural link roads'
    ],
    safetyGuidelines: [
      'Never cross railway tracks on foot; use designated level crossings',
      'Avoid walking alone on the station approach road after 8:00 PM',
      'Pre-book transit or coordinate with college security before arrival'
    ],
    facilities: [
      'Railway Station Ticket Counter',
      'Local Tea Stall & Refreshments'
    ],
    emergencyContacts: {
      police: '112',
      medical: '108',
      touristHelpline: '1363'
    },
    activeHours: { start: '05:00', end: '20:30' },
    isSurveillanceActive: false,
    lastAuditDate: '2026-02-15'
  },

  // 9. RUNAKTA HIGHWAY JUNCTION & COMMERCIAL BAZAAR (CAUTION ZONE)
  {
    id: 'runakta-junction-caution',
    name: 'Runakta Highway Junction & Market Area',
    subAreaName: 'Runakta Bazaar, Highway Dhabas & Auto Stand',
    category: 'market',
    type: 'caution',
    safetyLevel: 5,
    center: { lat: 27.2380, lng: 77.8820 },
    radius: 400,
    address: 'Runakta Bazaar & Bus Stop, NH-19, Agra-Mathura Road',
    landmark: 'Runakta Flyover, ~4 km East of SUA Anand Campus',
    city: 'Agra',
    state: 'Uttar Pradesh',
    pincode: '282007',
    description: 'Busy transit junction with local markets, highway dhabas, and auto stands. High vehicular traffic and pickpocket vulnerability during peak hours.',
    riskFactors: [
      'Fast moving high-speed trucks and highway traffic',
      'Pickpocketing in crowded evening bazaars and bus stops',
      'Unauthorized taxi/auto drivers overcharging tourists',
      'Poor lighting along unpaved service lanes'
    ],
    safetyGuidelines: [
      'Always use official zebra crossings or pedestrian flyovers to cross NH-19',
      'Keep bags and mobile phones securely zipped in crowds',
      'Use verified auto/taxi services or SafePath Driver Booking'
    ],
    facilities: [
      'Local Police Patrol Post',
      'Pharmacy & Local Clinic',
      'Public Bus Transit & Auto Stand',
      '24/7 Highway Dhabas'
    ],
    emergencyContacts: {
      police: '112',
      medical: '108',
      touristHelpline: '1363'
    },
    activeHours: { start: '06:00', end: '21:00' },
    isSurveillanceActive: false,
    lastAuditDate: '2026-02-01'
  },

  // 10. SIKANDRA AKBAR TOMB HERITAGE ZONE (SAFE ZONE)
  {
    id: 'sikandra-heritage-safe',
    name: 'Sikandra (Akbar\'s Tomb) Heritage Area',
    subAreaName: 'Mughal Monument Complex & ASI Protected Gardens',
    category: 'monument',
    type: 'safe',
    safetyLevel: 8,
    center: { lat: 27.2206, lng: 77.9505 },
    radius: 500,
    address: 'Tomb of Akbar the Great, Sikandra, Agra',
    landmark: 'Mathura Road, Sikandra Crossing',
    city: 'Agra',
    state: 'Uttar Pradesh',
    pincode: '282007',
    description: 'Prominent UNESCO heritage candidate complex with ASI security staff, tourist police deployment, ticketed perimeter, and paved tourist pathways.',
    riskFactors: [
      'High summer heat and sun exposure in open courtyards',
      'Street vendors and unaccredited guides outside the entry gateway'
    ],
    safetyGuidelines: [
      'Hire only government-authorized guides with valid ID cards',
      'Stay hydrated and keep tickets safe for exit inspection'
    ],
    facilities: [
      'Archaeological Survey of India (ASI) Security Guard Desk',
      'Drinking Water Dispensers',
      'Clean Restrooms & Tourist Helpdesk',
      'Parking Area with CCTV'
    ],
    emergencyContacts: {
      police: '112',
      medical: '108',
      touristHelpline: '1363'
    },
    activeHours: { start: '06:00', end: '18:30' },
    isSurveillanceActive: true,
    lastAuditDate: '2026-01-25'
  },

  // 11. TAJ MAHAL HERITAGE ZONE (MAXIMUM SECURITY SAFE ZONE)
  {
    id: 'taj-mahal-security-zone',
    name: 'Taj Mahal Protected Heritage Zone',
    subAreaName: 'UNESCO Monument Perimeter & CISF High-Security Tier',
    category: 'monument',
    type: 'safe',
    safetyLevel: 10,
    center: { lat: 27.1751, lng: 78.0421 },
    radius: 800,
    address: 'Dharmapuri, Forest Colony, Tajganj, Agra, Uttar Pradesh 282001',
    landmark: 'East & West Gate Taj Mahal Complex',
    city: 'Agra',
    state: 'Uttar Pradesh',
    pincode: '282001',
    description: 'World Heritage monument with maximum tier-1 security, CISF deployment, Tourist Police assistance booths, metal detectors, and 360° AI CCTV monitoring.',
    riskFactors: [
      'Severe overcrowding during sunrise, sunset, and public holidays',
      'Touts and souvenir sellers in Tajganj approach alleys'
    ],
    safetyGuidelines: [
      'Prohibited items: large backpacks, cigarettes, lighters, tripods, food items',
      'Approach dedicated Tourist Police booths in case of lost belongings or distress'
    ],
    facilities: [
      'CISF Paramilitary Security Guarding',
      'Tourist Police 24/7 Kiosk',
      'Electric Golf Cart Transit',
      'First Aid Medical Clinic',
      'Free Cloakrooms & Wheelchair Access'
    ],
    emergencyContacts: {
      police: '112',
      medical: '108',
      touristHelpline: '1363'
    },
    activeHours: { start: '06:00', end: '19:00' },
    isSurveillanceActive: true,
    lastAuditDate: '2026-02-18'
  },

  // 12. YAMUNA RIVERBANK ISOLATED CORRIDOR (DANGER ZONE)
  {
    id: 'yamuna-lowlight-danger',
    name: 'Yamuna Riverbank Isolated Low-Light Zone',
    subAreaName: 'Riverbed Floodplain Behind Agra Fort',
    category: 'nature',
    type: 'danger',
    safetyLevel: 2,
    center: { lat: 27.1850, lng: 78.0350 },
    radius: 450,
    address: 'Riverbed Plains Behind Agra Fort - Yamuna Kinara Road',
    landmark: 'Strachey Bridge to Fort Ghat',
    city: 'Agra',
    state: 'Uttar Pradesh',
    pincode: '282003',
    description: 'Unlit and unpatrolled riverbank zone with irregular terrain, dense undergrowth, and high vulnerability to crime and river flooding.',
    riskFactors: [
      'Zero police patrols and no street lighting',
      'High risk of mugging and violent theft after dark',
      'Sudden deep waters and quicksand near river edges'
    ],
    safetyGuidelines: [
      'Strictly avoid walking along the river floodplain alone or after sunset',
      'Use main Yamuna Kinara arterial road instead of riverbed paths'
    ],
    facilities: [],
    emergencyContacts: {
      police: '112',
      medical: '108',
      touristHelpline: '1363'
    },
    activeHours: { start: '09:00', end: '16:00' },
    isSurveillanceActive: false,
    lastAuditDate: '2026-02-05'
  }
]

export const SHARDA_UNIVERSITY_HOTSPOT = SHARDA_AGRA_ZONES[0]
