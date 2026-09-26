import tariffConfig from '@/config/tariffs/agra_regional_tariffs.json'

export interface VehicleTariff {
  id: string
  name: string
  nameHindi: string
  baseTariff: number
  baseDistanceKm: number
  perKmRate: number
  waitingChargePerMin: number
  luggageChargePerPiece: number
  icon: string
}

export interface FairFareResult {
  distanceKm: number
  vehicleType: string
  vehicleName: string
  vehicleNameHindi: string
  baseTariff: number
  perKmRate: number
  additionalKm: number
  isNightTariff: boolean
  nightMultiplier: number
  weatherFactor: number
  luggageCharge: number
  exactCalculatedFare: number
  recommendedPrice: number
  toleranceCorridor: {
    minFare: number
    maxFare: number
    formattedRange: string
  }
  regulatoryCitation: string
  regulatoryAuthority: string
  localScriptTranslation: {
    language: string
    translatedHeadline: string
    translatedTariffSummary: string
    audioBroadcastText: string
  }
}

export class FairFareClientEngine {
  private static instance: FairFareClientEngine

  private constructor() {}

  public static getInstance(): FairFareClientEngine {
    if (!FairFareClientEngine.instance) {
      FairFareClientEngine.instance = new FairFareClientEngine()
    }
    return FairFareClientEngine.instance
  }

  public isNightTariff(hour?: number): boolean {
    const h = hour !== undefined ? hour : new Date().getHours()
    return h >= 23 || h < 5
  }

  public calculateFare(params: {
    distanceKm: number
    vehicleType?: 'auto_rickshaw' | 'taxi_non_ac' | 'taxi_ac' | 'e_rickshaw'
    isNight?: boolean
    weatherFactor?: number
    luggageCount?: number
    destinationName?: string
    destinationHindi?: string
  }): FairFareResult {
    const {
      distanceKm,
      vehicleType = 'auto_rickshaw',
      isNight,
      weatherFactor = 1.0,
      luggageCount = 0,
      destinationName = 'Destination',
      destinationHindi = 'Destination'
    } = params

    const categories = tariffConfig.vehicleCategories as Record<string, VehicleTariff>
    const vConfig: VehicleTariff = categories[vehicleType] || categories.auto_rickshaw

    const nightApplied = isNight !== undefined ? isNight : this.isNightTariff()
    const nightMultiplier = nightApplied ? tariffConfig.nightTariffHours.multiplier : 1.0

    const additionalKm = Math.max(0, distanceKm - vConfig.baseDistanceKm)
    const runningCost = vConfig.baseTariff + additionalKm * vConfig.perKmRate
    const adjustedFare = runningCost * nightMultiplier * weatherFactor
    const luggageCharge = luggageCount * vConfig.luggageChargePerPiece
    const totalFare = adjustedFare + luggageCharge

    const exactCalculatedFare = Number(totalFare.toFixed(2))
    const recommendedPrice = Math.round(totalFare / 5.0) * 5
    const minFare = Math.round(totalFare * 0.95)
    let maxFare = Math.round(totalFare * 1.05)
    if (maxFare <= minFare) maxFare = minFare + 10

    const formattedRange = `₹${minFare} — ₹${maxFare}`

    return {
      distanceKm: Number(distanceKm.toFixed(2)),
      vehicleType,
      vehicleName: vConfig.name,
      vehicleNameHindi: vConfig.nameHindi,
      baseTariff: vConfig.baseTariff,
      perKmRate: vConfig.perKmRate,
      additionalKm: Number(additionalKm.toFixed(2)),
      isNightTariff: nightApplied,
      nightMultiplier,
      weatherFactor,
      luggageCharge,
      exactCalculatedFare,
      recommendedPrice,
      toleranceCorridor: {
        minFare,
        maxFare,
        formattedRange
      },
      regulatoryCitation: tariffConfig.gazetteNotificationCode,
      regulatoryAuthority: tariffConfig.regulatoryAuthority,
      localScriptTranslation: {
        language: 'English (Official Municipal)',
        translatedHeadline: `${destinationName} ➔ ${formattedRange}`,
        translatedTariffSummary: `Official Municipal Meter Rate: First 1.5 km = ₹${vConfig.baseTariff}, additional distance = ₹${vConfig.perKmRate}/km`,
        audioBroadcastText: `Hello, according to official municipal meter rates, the regulated fare for this trip is ${recommendedPrice} rupees.`
      }
    }
  }

  public getPopularRoutes() {
    return tariffConfig.popularFixedRoutes
  }
}

export const fairFareClient = FairFareClientEngine.getInstance()
