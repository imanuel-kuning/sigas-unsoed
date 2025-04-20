interface Dataset {
  _id: string
  text: string
  sentiment: string
}

interface Post extends Dataset {
  location: string
  date: string
}

interface Preprocessed extends Post {
  clean: string
  stem: string
  stopword: string
}

interface Vector {
  feature: number[]
  label: number
}

interface Settings {
  dataset_size: string
  max_features: string
  oversampling: string
  test_size: string
  n_estimators: string
  tree_depth: string
}

interface Analysis {
  accuracy: string
  precision: string
  recall: string
  f1_score: string
  confusion_matrix: {
    tp: number
    tn: number
    fp: number
    fn: number
  }
}

interface GroupedResult {
  location: string
  positive: number
  negative: number
}

interface FeatureProps {
  feature: GeoJsonObject
  layer: Layer
}

interface ChartData {
  label: string
  data: number[]
  backgroundColor: string
  borderColor: string
}

interface ChartProps {
  labels: string[]
  datasets: ChartData[]
}
