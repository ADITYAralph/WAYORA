export interface TouristZone {
  id: string
  name: string
  monumentName: string
  location: { lat: number; lng: number }
  city: string
  state: string
  type: 'safe' | 'caution' | 'danger' | 'restricted'
  radius: number // meters
  safetyLevel: number // 1-10
  description: string
  emergencyContacts: {
    police: string
    medical: string
    tourist_helpline: string
  }
  facilities: string[]
  riskFactors: string[]
  lastUpdated: string
  isActive: boolean
}

export const REAL_INDIA_TOURIST_ZONES: TouristZone[] = [
  // SUA: SHARDA UNIVERSITY AGRA (ANAND ENGINEERING COLLEGE CAMPUS)
  {
    id: 'sua_academic_core',
    name: 'SUA: Sharda University Agra (Anand Engineering College Campus)',
    monumentName: 'SUA: Sharda University Agra (AEC Campus)',
    location: { lat: 27.2481, lng: 77.8345 },
    city: 'Agra',
    state: 'Uttar Pradesh',
    type: 'safe',
    radius: 350,
    safetyLevel: 9,
    description: 'Premier university and engineering campus combining SUA (Sharda University Agra) and Anand Engineering College across 60+ acres, with 24/7 security control, CCTV perimeter, lecture halls, and medical clinics.',
    emergencyContacts: {
      police: '112',
      medical: '108',
      tourist_helpline: '1363'
    },
    facilities: ['24/7 Security Control Room', 'Full CCTV Coverage', 'First Aid & Medical Clinic', 'Central RO Water', 'Wi-Fi & Fire Safety'],
    riskFactors: ['Heavy student movement during class intervals', 'Restricted high-voltage panel areas'],
    lastUpdated: '2026-02-21',
    isActive: true
  },
  {
    id: 'sharda_aec_main_gate_highway',
    name: 'AEC Main Gate & NH-19 Highway Service Corridor',
    monumentName: 'AEC Main Gate & Bus Terminal',
    location: { lat: 27.2512, lng: 77.8335 },
    city: 'Agra',
    state: 'Uttar Pradesh',
    type: 'caution',
    radius: 200,
    safetyLevel: 6,
    description: 'Front gate vehicular checkpost, visitor parking, student bus boarding bays, and NH-19 highway access service road.',
    emergencyContacts: {
      police: '112',
      medical: '108',
      tourist_helpline: '1363'
    },
    facilities: ['Armed Security Booth', 'Boom Barriers & ANPR Cameras', 'Visitor Kiosk', 'Shaded Bus Bay'],
    riskFactors: ['Fast-moving truck traffic on NH-19 highway', 'Blind turning spots', 'Unauthorized auto-rickshaws on shoulder'],
    lastUpdated: '2026-02-21',
    isActive: true
  },
  {
    id: 'sharda_aec_girls_hostel',
    name: 'Anand Girls Hostel & Faculty Residential Enclave',
    monumentName: 'AEC Girls Hostel & Faculty Enclave',
    location: { lat: 27.2470, lng: 77.8375 },
    city: 'Agra',
    state: 'Uttar Pradesh',
    type: 'safe',
    radius: 200,
    safetyLevel: 10,
    description: 'Tier-1 protected residential enclave with high boundary wall, dedicated female security personnel, biometric entry turnstiles, and direct SOS alarm hotline.',
    emergencyContacts: {
      police: '112',
      medical: '108',
      tourist_helpline: '1363'
    },
    facilities: ['24/7 Female Guards & Warden Office', 'Biometric Access', 'Indoor Medical Dispensary', 'Gym & Dining'],
    riskFactors: ['Restricted entry for visitors', 'Curfew check-in after 7:30 PM'],
    lastUpdated: '2026-02-21',
    isActive: true
  },
  {
    id: 'sharda_aec_boys_hostel',
    name: 'Anand Boys Hostels & Central Dining Complex',
    monumentName: 'AEC Boys Hostels (A, B, C)',
    location: { lat: 27.2450, lng: 77.8355 },
    city: 'Agra',
    state: 'Uttar Pradesh',
    type: 'safe',
    radius: 280,
    safetyLevel: 8,
    description: 'Multi-block residential zone for students with security checkpoints, night warden patrols, student dining halls, and sports recreation lounges.',
    emergencyContacts: {
      police: '112',
      medical: '108',
      tourist_helpline: '1363'
    },
    facilities: ['24/7 Security Posts', 'Student Mess & Night Canteen', 'CCTV on Stairwells', 'Emergency Vehicle on Standby'],
    riskFactors: ['Dimly lit pathways near sports ground after 10 PM', 'Movement restricted outside campus wall at night'],
    lastUpdated: '2026-02-21',
    isActive: true
  },
  {
    id: 'sharda_aec_sports_complex',
    name: 'Anand Sports Stadium & Athletic Grounds',
    monumentName: 'AEC Sports Stadium & Cricket Ground',
    location: { lat: 27.2440, lng: 77.8335 },
    city: 'Agra',
    state: 'Uttar Pradesh',
    type: 'safe',
    radius: 260,
    safetyLevel: 8,
    description: 'Athletic facility with cricket ground, football field, basketball and tennis courts, surrounded by perimeter security fencing.',
    emergencyContacts: {
      police: '112',
      medical: '108',
      tourist_helpline: '1363'
    },
    facilities: ['Floodlit Courts', 'Drinking Water Dispensers', 'Sports Injury First Aid', 'Perimeter Patrols'],
    riskFactors: ['Summer midday heat exposure', 'Isolated outer boundary after 9:00 PM'],
    lastUpdated: '2026-02-21',
    isActive: true
  },
  {
    id: 'sharda_aec_workshops_innovation',
    name: 'AEC Mechanical Workshops & Technology Labs',
    monumentName: 'AEC Mechanical Workshops & Labs',
    location: { lat: 27.2490, lng: 77.8320 },
    city: 'Agra',
    state: 'Uttar Pradesh',
    type: 'safe',
    radius: 180,
    safetyLevel: 8,
    description: 'Engineering workshops, manufacturing labs, robotics centers, and high-voltage testing hangars with industrial safety protocols.',
    emergencyContacts: {
      police: '112',
      medical: '108',
      tourist_helpline: '1363'
    },
    facilities: ['Industrial Fire Hydrant System', 'Eye-Wash Stations', 'First Aid Response', 'Instructor Supervision'],
    riskFactors: ['Operating heavy CNC machinery & welding tools', 'High-voltage testing zones'],
    lastUpdated: '2026-02-21',
    isActive: true
  },
  {
    id: 'keetham_station_approach',
    name: 'Keetham Railway Station & Rural Approach Road',
    monumentName: 'Keetham Railway Station Approach',
    location: { lat: 27.2430, lng: 77.8280 },
    city: 'Agra',
    state: 'Uttar Pradesh',
    type: 'caution',
    radius: 350,
    safetyLevel: 5,
    description: 'Local railway station and connecting rural link road providing passenger train access to Agra and Mathura. Sparsely lit at night.',
    emergencyContacts: {
      police: '112',
      medical: '108',
      tourist_helpline: '1363'
    },
    facilities: ['Railway Station Ticket Counter', 'Local Tea Stall'],
    riskFactors: ['Semi-manned railway crossing', 'Sparse street lighting after sunset', 'Isolated road stretch'],
    lastUpdated: '2026-02-21',
    isActive: true
  },
  {
    id: 'keetham_lake_danger',
    name: 'Sur Sarovar (Keetham Lake) Forest Perimeter',
    monumentName: 'Sur Sarovar Bird Sanctuary & Keetham Forest',
    location: { lat: 27.2510, lng: 77.8420 },
    city: 'Agra',
    state: 'Uttar Pradesh',
    type: 'danger',
    radius: 650,
    safetyLevel: 2,
    description: 'Protected national wetland ecosystem and dense reserve forest. High biodiversity with wild animal presence. Strictly restricted after dark.',
    emergencyContacts: {
      police: '112',
      medical: '108',
      tourist_helpline: '1363'
    },
    facilities: ['Forest Ranger Checkpoint (Daytime Only)', 'Bear Rescue Facility Entry Point Nearby'],
    riskFactors: ['Zero lighting and poor cellular connectivity in deep forest', 'Wildlife encounters (snakes, jackals)', 'Marshy terrain with drowning risk', 'Restricted entry after 5:30 PM'],
    lastUpdated: '2026-02-21',
    isActive: true
  },
  {
    id: 'runakta_junction_caution',
    name: 'Runakta Highway Junction & Market Area',
    monumentName: 'Runakta Transit Hub (Near Sharda University)',
    location: { lat: 27.2380, lng: 77.8820 },
    city: 'Agra',
    state: 'Uttar Pradesh',
    type: 'caution',
    radius: 400,
    safetyLevel: 5,
    description: 'Busy transit junction with local markets, highway dhabas, and auto stands. High vehicular traffic and pickpocket vulnerability during peak hours.',
    emergencyContacts: {
      police: '112',
      medical: '108',
      tourist_helpline: '1363'
    },
    facilities: ['Local Police Patrol Post', 'Pharmacy & Clinic', 'Bus & Auto Transit', '24/7 Highway Dhabas'],
    riskFactors: ['Fast moving high-speed trucks and highway traffic', 'Pickpocketing in crowded bazaars', 'Poor lighting on service lanes'],
    lastUpdated: '2026-02-21',
    isActive: true
  },
  {
    id: 'sikandra_heritage_safe',
    name: 'Sikandra (Akbar\'s Tomb) Heritage Area',
    monumentName: 'Tomb of Akbar the Great (Sikandra)',
    location: { lat: 27.2206, lng: 77.9505 },
    city: 'Agra',
    state: 'Uttar Pradesh',
    type: 'safe',
    radius: 500,
    safetyLevel: 8,
    description: 'Prominent UNESCO heritage candidate complex with ASI security staff, tourist police deployment, ticketed perimeter, and paved tourist pathways.',
    emergencyContacts: {
      police: '112',
      medical: '108',
      tourist_helpline: '1363'
    },
    facilities: ['ASI Security Guard Desk', 'Drinking Water Dispensers', 'Clean Restrooms', 'Parking Area with CCTV'],
    riskFactors: ['High summer heat in open courtyards', 'Street vendors outside entry gateway'],
    lastUpdated: '2026-02-20',
    isActive: true
  },

  // TAJ MAHAL, AGRA
  {
    id: 'taj_mahal_main',
    name: 'Taj Mahal Main Complex',
    monumentName: 'Taj Mahal',
    location: { lat: 27.1751, lng: 78.0421 },
    city: 'Agra',
    state: 'Uttar Pradesh',
    type: 'safe',
    radius: 300,
    safetyLevel: 9,
    description: 'UNESCO World Heritage Site with maximum security and tourist police presence',
    emergencyContacts: {
      police: '100',
      medical: '108', 
      tourist_helpline: '1363'
    },
    facilities: ['CCTV', 'Security Personnel', 'First Aid', 'Tourist Information', 'Guides'],
    riskFactors: ['Overcrowding during peak season', 'Heat during summer months'],
    lastUpdated: '2025-09-20',
    isActive: true
  },
  {
    id: 'taj_mahal_parking',
    name: 'Taj Mahal Parking Area',
    monumentName: 'Taj Mahal',
    location: { lat: 27.1730, lng: 78.0390 },
    city: 'Agra',
    state: 'Uttar Pradesh',
    type: 'caution',
    radius: 200,
    safetyLevel: 6,
    description: 'Main parking area with basic security, risk of vehicle theft',
    emergencyContacts: {
      police: '100',
      medical: '108',
      tourist_helpline: '1363'
    },
    facilities: ['Parking Security', 'CCTV', 'Refreshments'],
    riskFactors: ['Vehicle theft', 'Pickpocketing', 'Overcharging by vendors'],
    lastUpdated: '2025-09-20',
    isActive: true
  },

  // RED FORT, DELHI
  {
    id: 'red_fort_main',
    name: 'Red Fort Main Complex',
    monumentName: 'Red Fort (Lal Qila)',
    location: { lat: 28.6562, lng: 77.2410 },
    city: 'New Delhi',
    state: 'Delhi',
    type: 'safe',
    radius: 250,
    safetyLevel: 8,
    description: 'Historic Mughal fort with ASI security and Delhi Police presence',
    emergencyContacts: {
      police: '100',
      medical: '102',
      tourist_helpline: '1363'
    },
    facilities: ['ASI Security', 'Metro Station Nearby', 'Audio Guides', 'Museum'],
    riskFactors: ['Overcrowding during national holidays', 'Summer heat'],
    lastUpdated: '2025-09-20',
    isActive: true
  },
  {
    id: 'chandni_chowk_market',
    name: 'Chandni Chowk Market',
    monumentName: 'Red Fort Area',
    location: { lat: 28.6506, lng: 77.2334 },
    city: 'New Delhi',
    state: 'Delhi',
    type: 'caution',
    radius: 400,
    safetyLevel: 5,
    description: 'Busy traditional market area with moderate safety concerns',
    emergencyContacts: {
      police: '100',
      medical: '102',
      tourist_helpline: '1363'
    },
    facilities: ['Market Security', 'ATMs', 'Traditional Food', 'Shopping'],
    riskFactors: ['Pickpocketing', 'Overcrowding', 'Traffic congestion', 'Food safety'],
    lastUpdated: '2025-09-20',
    isActive: true
  },

  // GOLDEN TEMPLE, AMRITSAR
  {
    id: 'golden_temple_main',
    name: 'Golden Temple Complex',
    monumentName: 'Harmandir Sahib (Golden Temple)',
    location: { lat: 31.6200, lng: 74.8765 },
    city: 'Amritsar',
    state: 'Punjab',
    type: 'safe',
    radius: 300,
    safetyLevel: 9,
    description: 'Holiest Sikh shrine with excellent community security and volunteers',
    emergencyContacts: {
      police: '100',
      medical: '108',
      tourist_helpline: '1363'
    },
    facilities: ['Community Security', 'Free Food', 'Medical Aid', 'Accommodation', 'Shoe Storage'],
    riskFactors: ['Large crowds during festivals', 'Slippery marble floors when wet'],
    lastUpdated: '2025-09-20',
    isActive: true
  },

  // GATEWAY OF INDIA, MUMBAI
  {
    id: 'gateway_of_india_main',
    name: 'Gateway of India',
    monumentName: 'Gateway of India',
    location: { lat: 18.9220, lng: 72.8347 },
    city: 'Mumbai',
    state: 'Maharashtra',
    type: 'safe',
    radius: 200,
    safetyLevel: 7,
    description: 'Iconic Mumbai landmark with Mumbai Police and Coast Guard presence',
    emergencyContacts: {
      police: '100',
      medical: '108',
      tourist_helpline: '1363'
    },
    facilities: ['Police Booth', 'Boat Services', 'Photography', 'Street Food'],
    riskFactors: ['Sea spray during monsoon', 'Pickpocketing in crowds'],
    lastUpdated: '2025-09-20',
    isActive: true
  },

  // HAWA MAHAL, JAIPUR
  {
    id: 'hawa_mahal_main',
    name: 'Hawa Mahal Palace',
    monumentName: 'Hawa Mahal (Palace of Winds)',
    location: { lat: 26.9239, lng: 75.8267 },
    city: 'Jaipur',
    state: 'Rajasthan',
    type: 'safe',
    radius: 150,
    safetyLevel: 8,
    description: 'Famous pink sandstone palace with Rajasthan Police protection',
    emergencyContacts: {
      police: '100',
      medical: '108',
      tourist_helpline: '1363'
    },
    facilities: ['Security Guards', 'Photography', 'Guided Tours', 'Souvenir Shop'],
    riskFactors: ['Narrow stairs for elderly', 'Heat during summer'],
    lastUpdated: '2025-09-20',
    isActive: true
  },

  // MYSORE PALACE, KARNATAKA
  {
    id: 'mysore_palace_main',
    name: 'Mysore Palace',
    monumentName: 'Mysore Palace',
    location: { lat: 12.3051, lng: 76.6551 },
    city: 'Mysore',
    state: 'Karnataka',
    type: 'safe',
    radius: 250,
    safetyLevel: 8,
    description: 'Magnificent royal palace with Karnataka Police security',
    emergencyContacts: {
      police: '100',
      medical: '108',
      tourist_helpline: '1363'
    },
    facilities: ['Palace Security', 'Audio Guides', 'Light Show', 'Museum'],
    riskFactors: ['Crowds during Dussehra festival', 'Photography restrictions'],
    lastUpdated: '2025-09-20',
    isActive: true
  },

  // LOTUS TEMPLE, DELHI
  {
    id: 'lotus_temple_main',
    name: 'Lotus Temple',
    monumentName: "Bahá'í House of Worship",
    location: { lat: 28.5535, lng: 77.2588 },
    city: 'New Delhi',
    state: 'Delhi',
    type: 'safe',
    radius: 200,
    safetyLevel: 9,
    description: 'Peaceful Bahá\'í temple with excellent security and maintenance',
    emergencyContacts: {
      police: '100',
      medical: '102',
      tourist_helpline: '1363'
    },
    facilities: ['Temple Security', 'Meditation Hall', 'Gardens', 'Information Center'],
    riskFactors: ['Silence required inside', 'No photography inside'],
    lastUpdated: '2025-09-20',
    isActive: true
  },

  // VICTORIA MEMORIAL, KOLKATA
  {
    id: 'victoria_memorial_main',
    name: 'Victoria Memorial',
    monumentName: 'Victoria Memorial',
    location: { lat: 22.5448, lng: 88.3426 },
    city: 'Kolkata',
    state: 'West Bengal',
    type: 'safe',
    radius: 300,
    safetyLevel: 7,
    description: 'British-era monument with West Bengal Police security',
    emergencyContacts: {
      police: '100',
      medical: '108',
      tourist_helpline: '1363'
    },
    facilities: ['Police Security', 'Museum', 'Gardens', 'Light Show'],
    riskFactors: ['Monsoon flooding', 'Political demonstrations nearby'],
    lastUpdated: '2025-09-20',
    isActive: true
  },

  // MEENAKSHI TEMPLE, MADURAI
  {
    id: 'meenakshi_temple_main',
    name: 'Meenakshi Amman Temple',
    monumentName: 'Meenakshi Amman Temple',
    location: { lat: 9.9195, lng: 78.1193 },
    city: 'Madurai',
    state: 'Tamil Nadu',
    type: 'safe',
    radius: 200,
    safetyLevel: 8,
    description: 'Ancient Tamil temple with temple security and Tamil Nadu Police',
    emergencyContacts: {
      police: '100',
      medical: '108',
      tourist_helpline: '1363'
    },
    facilities: ['Temple Security', 'Shoe Storage', 'Prasadam', 'Guide Services'],
    riskFactors: ['Large crowds during festivals', 'Strict dress code'],
    lastUpdated: '2025-09-20',
    isActive: true
  }
]
