import { NationalCorridor } from '../types/safepathX.types'

export const NATIONAL_TOURISM_CORRIDORS: NationalCorridor[] = [
  // 1. GOLDEN TRIANGLE CORRIDOR (Delhi - Agra - Jaipur)
  {
    id: 'corridor-golden-triangle',
    name: 'National Golden Triangle Circuit (Delhi-Agra-Jaipur)',
    region: 'North',
    statesCovered: ['DL', 'UP', 'RJ'],
    keyWaypoints: [
      { name: 'India Gate, New Delhi', lat: 28.6129, lng: 77.2295 },
      { name: 'Red Fort, New Delhi', lat: 28.6562, lng: 77.2410 },
      { name: 'SUA / Anand Campus, Keetham, Agra', lat: 27.2481, lng: 77.8345 },
      { name: 'Taj Mahal Protected Zone, Agra', lat: 27.1751, lng: 78.0421 },
      { name: 'Fatehpur Sikri, UP', lat: 27.0945, lng: 77.6679 },
      { name: 'Hawa Mahal & City Palace, Jaipur', lat: 26.9239, lng: 75.8267 },
      { name: 'Amber Fort, Jaipur', lat: 26.9855, lng: 75.8513 }
    ],
    totalDistanceKm: 720,
    averageSafetyRating: 8.6,
    highRiskSectors: [
      {
        name: 'Sur Sarovar Keetham Wetland Forest (Agra)',
        lat: 27.2510,
        lng: 77.8420,
        radiusMeters: 650,
        riskReason: 'Dense forest, wild animals, unlit after dark',
        curfewStart: '17:30'
      },
      {
        name: 'Yamuna Riverbed Floodplain Behind Agra Fort',
        lat: 27.1850,
        lng: 78.0350,
        radiusMeters: 450,
        riskReason: 'Isolated low-light riverbed terrain, robbery vulnerability'
      },
      {
        name: 'NH-21 Dausa-Bharatpur Highway Isolated Stretches',
        lat: 26.9920,
        lng: 76.5810,
        radiusMeters: 800,
        riskReason: 'High speed heavy transit, unlit night sections'
      }
    ],
    emergencyHubs: [
      { name: 'Delhi Tourist Police Headquarters', type: 'police', phone: '112 / 011-23363300', lat: 28.6139, lng: 77.2090 },
      { name: 'Agra Commissionerate Tourist Police Cell', type: 'police', phone: '112 / 1363', lat: 27.1751, lng: 78.0421 },
      { name: 'SUA / Anand Campus Security Command', type: 'police', phone: '+91 5613 272026', lat: 27.2481, lng: 77.8345 },
      { name: 'Jaipur Tourist Assistance Police Post', type: 'police', phone: '112 / 0141-2601728', lat: 26.9239, lng: 75.8267 }
    ]
  },

  // 2. HIMALAYAN DEVBHUMI CORRIDOR (Haridwar - Rishikesh - Dehradun)
  {
    id: 'corridor-himalayan-pilgrim',
    name: 'Himalayan Foothills & Spiritual Corridor (Haridwar-Rishikesh)',
    region: 'North',
    statesCovered: ['UK'],
    keyWaypoints: [
      { name: 'Har Ki Pauri, Haridwar', lat: 29.9567, lng: 78.1707 },
      { name: 'Ram Jhula & Triveni Ghat, Rishikesh', lat: 30.1235, lng: 78.3149 },
      { name: 'Laxman Jhula & Tapovan, Rishikesh', lat: 30.1368, lng: 78.3308 },
      { name: 'Dehradun Clock Tower', lat: 30.3256, lng: 78.0437 }
    ],
    totalDistanceKm: 120,
    averageSafetyRating: 8.9,
    highRiskSectors: [
      {
        name: 'Ganga River Rapid Torrent Zones (Shivpuri)',
        lat: 30.1380,
        lng: 78.3890,
        radiusMeters: 500,
        riskReason: 'High velocity river currents, flash flood hazard',
        curfewStart: '18:00'
      },
      {
        name: 'Rajaji National Park Boundary Forest Corridor',
        lat: 29.9820,
        lng: 78.2150,
        radiusMeters: 900,
        riskReason: 'Elephant corridor, restricted wildlife zone'
      }
    ],
    emergencyHubs: [
      { name: 'SDRF River Rescue Control, Rishikesh', type: 'medical', phone: '112 / 1070', lat: 30.1235, lng: 78.3149 },
      { name: 'Haridwar Tourist Police Kiosk', type: 'police', phone: '112 / 1363', lat: 29.9567, lng: 78.1707 }
    ]
  },

  // 3. WEST COAST & KONKAN HERITAGE CIRCUIT (Mumbai - Goa - Hampi)
  {
    id: 'corridor-konkan-coastal',
    name: 'Konkan & Western Ghats Coastal Circuit (Mumbai-Goa-Hampi)',
    region: 'West',
    statesCovered: ['MH', 'GA', 'KA'],
    keyWaypoints: [
      { name: 'Gateway of India & Colaba, Mumbai', lat: 18.9220, lng: 72.8347 },
      { name: 'Baga & Calangute Coastal Strip, Goa', lat: 15.5553, lng: 73.7517 },
      { name: 'Old Goa Basilica of Bom Jesus', lat: 15.5009, lng: 73.9116 },
      { name: 'Hampi UNESCO Ruins, Karnataka', lat: 15.3350, lng: 76.4600 }
    ],
    totalDistanceKm: 980,
    averageSafetyRating: 8.7,
    highRiskSectors: [
      {
        name: 'High Tide Rip Current Zones (Anjuna Beach)',
        lat: 15.5730,
        lng: 73.7410,
        radiusMeters: 400,
        riskReason: 'Dangerous sea rip currents, monsoon high waves',
        curfewStart: '19:00'
      },
      {
        name: 'Tungabhadra River Boulder Zone (Anegundi Hampi)',
        lat: 15.3480,
        lng: 76.4710,
        radiusMeters: 550,
        riskReason: 'Slippery rock terrain, isolated boulder alleys at night'
      }
    ],
    emergencyHubs: [
      { name: 'Mumbai Coastal Police Control', type: 'police', phone: '112 / 022-22620111', lat: 18.9220, lng: 72.8347 },
      { name: 'Goa Coastal Lifeguard Command (Drishti)', type: 'medical', phone: '112 / 0832-2419400', lat: 15.5553, lng: 73.7517 }
    ]
  }
]
