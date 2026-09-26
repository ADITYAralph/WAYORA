import { StateControlRoom } from '../types/safepathX.types'

export const STATE_COMMAND_REGISTRY: Record<string, StateControlRoom> = {
  UP: {
    stateCode: 'UP',
    stateName: 'Uttar Pradesh',
    policeHQ: 'UP 112 Emergency Operations Center, Lucknow',
    tourismBoard: 'Uttar Pradesh Tourism Development Corporation',
    erssEndpoint: 'https://erss.up.gov.in/cad/api/v1/dispatch',
    emergencyHelpline: '112 / 108 / 1363',
    activePatrolUnits: 420,
    activeTouristCount: 1845,
    alertCount: 2,
    coveragePolygonCenter: { lat: 27.1751, lng: 78.0421 } // Agra / Central UP
  },
  DL: {
    stateCode: 'DL',
    stateName: 'Delhi NCT',
    policeHQ: 'Delhi Police Central Command & Control Center (C4i)',
    tourismBoard: 'Delhi Tourism and Transportation Development Corp (DTTDC)',
    erssEndpoint: 'https://delhipolice.gov.in/erss112/dispatch',
    emergencyHelpline: '112 / 1091',
    activePatrolUnits: 310,
    activeTouristCount: 2420,
    alertCount: 1,
    coveragePolygonCenter: { lat: 28.6139, lng: 77.2090 }
  },
  RJ: {
    stateCode: 'RJ',
    stateName: 'Rajasthan',
    policeHQ: 'Rajasthan Police Headquarters & Abhay Command Center, Jaipur',
    tourismBoard: 'Rajasthan Tourism Development Corporation (RTDC)',
    erssEndpoint: 'https://police.rajasthan.gov.in/erss/cad',
    emergencyHelpline: '112 / 1090',
    activePatrolUnits: 280,
    activeTouristCount: 1690,
    alertCount: 0,
    coveragePolygonCenter: { lat: 26.9239, lng: 75.8267 }
  },
  UK: {
    stateCode: 'UK',
    stateName: 'Uttarakhand',
    policeHQ: 'Uttarakhand Police State Command, Dehradun',
    tourismBoard: 'Uttarakhand Tourism Development Board (UTDB)',
    erssEndpoint: 'https://uttarakhandpolice.uk.gov.in/erss112',
    emergencyHelpline: '112 / 1070',
    activePatrolUnits: 140,
    activeTouristCount: 920,
    alertCount: 0,
    coveragePolygonCenter: { lat: 30.1235, lng: 78.3149 }
  },
  MH: {
    stateCode: 'MH',
    stateName: 'Maharashtra',
    policeHQ: 'Maharashtra State Police Command Center, Mumbai',
    tourismBoard: 'Maharashtra Tourism Development Corporation (MTDC)',
    erssEndpoint: 'https://mahapolice.gov.in/erss112',
    emergencyHelpline: '112 / 103',
    activePatrolUnits: 510,
    activeTouristCount: 3150,
    alertCount: 3,
    coveragePolygonCenter: { lat: 18.9220, lng: 72.8347 }
  },
  GA: {
    stateCode: 'GA',
    stateName: 'Goa',
    policeHQ: 'Goa Police Control Room, Panaji',
    tourismBoard: 'Goa Tourism Development Corporation (GTDC)',
    erssEndpoint: 'https://goapolice.gov.in/erss112',
    emergencyHelpline: '112 / 100',
    activePatrolUnits: 115,
    activeTouristCount: 1420,
    alertCount: 1,
    coveragePolygonCenter: { lat: 15.5553, lng: 73.7517 }
  },
  KA: {
    stateCode: 'KA',
    stateName: 'Karnataka',
    policeHQ: 'Karnataka State Police Command Center (KSP), Bengaluru',
    tourismBoard: 'Karnataka State Tourism Development Corporation (KSTDC)',
    erssEndpoint: 'https://ksp.karnataka.gov.in/erss112',
    emergencyHelpline: '112 / 100',
    activePatrolUnits: 390,
    activeTouristCount: 1880,
    alertCount: 0,
    coveragePolygonCenter: { lat: 15.3350, lng: 76.4600 }
  }
}
