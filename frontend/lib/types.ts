export interface SoilData {
  N: number; P: number; K: number;
  pH: number; moisture: number; organic_carbon: number;
  soil_type: string; region: string; source: string;
}

export interface HealthData {
  score: number; status: string; status_color: string;
  warnings: string[]; suggestions: string[];
  breakdown: {
    nitrogen_score: number; phosphorus_score: number;
    potassium_score: number; ph_score: number; organic_carbon_score: number;
  };
}

export interface FertilityData {
  fertility_level: string; fertility_score: number;
  confidence_pct: number;
  probabilities: { less_fertile: number; fertile: number; highly_fertile: number };
}

export interface WeatherData {
  total_rainfall_16d_mm: number; avg_temperature_c: number;
  avg_humidity_pct: number; rainfall_scenario: string;
  season_label: string; crop_season: string; forecast_days: number[];
}

export interface CropItem { crop: string; confidence_pct: number; }

export interface YieldData {
  yield_hg_per_ha: number | null; yield_tonnes_per_ha: number;
  yield_score_pct: number; fao_crop: string; yield_label: string;
}

export interface FertilizerData {
  urea_kg: number; dap_kg: number; mop_kg: number; note: string;
}

export interface SimulationSeason {
  season: number; N: number; P: number; K: number;
  pH: number; health_score: number; status: string; status_color: string;
}

export interface AnalysisResult {
  soil: SoilData; health: HealthData; fertility: FertilityData;
  weather: WeatherData; crops: CropItem[]; yield: YieldData;
  fertilizer: FertilizerData; simulation: SimulationSeason[]; advisory: string;
}

export interface SoilInput {
  lat: number; lng: number; state: string; district: string;
  N?: number; P?: number; K?: number; pH?: number;
  moisture?: number; organic_carbon?: number;
  source?: string; crop?: string; seasons?: number; apply_fertilizer?: boolean;
}

export interface DistrictDefaults {
  N: number; P: number; K: number; pH: number;
  organic_carbon: number; moisture: number;
  soil_type: string; region: string; source: string;
}
export interface SimulationSeason {
  season: number; N: number; P: number; K: number;
  pH: number; health_score: number; status: string; status_color: string;
  crop_days?: number;
  cumulative_days?: number;
  time_label?: string;
  crop_season?: string;
}