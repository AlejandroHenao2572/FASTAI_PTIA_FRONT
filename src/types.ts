export interface Circuit {
  display_name: string
  value: string
  circuit_key: string
  city: string
  circuit_type: number
}

export interface PredictionRow {
  position: number
  driver_code: string
  team: string
  grid_position: number
  score: number
  position_change: number
}

export interface PositionMove {
  driver: string
  from_pos: number
  to_pos: number
  change: number
}

export interface PredictionResult {
  success: boolean
  race_name: string
  year: number
  race_input: string
  predictions: PredictionRow[]
  podium: string[]
  gainers: PositionMove[]
  losers: PositionMove[]
}

export interface TrainingMetrics {
  seasons: number[]
  train_samples: number
  test_samples: number
  mae: number
  rmse: number
  top3_accuracy: number
  trained_at: string
}

export interface ModelStatus {
  model_available: boolean
  model_file: string | null
  stats_available: boolean
  report_available: boolean
  training_metrics: TrainingMetrics | null
}
