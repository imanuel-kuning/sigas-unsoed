'use server'

import { TfIdf } from 'natural'
import { Preprocessing } from '@/lib/preprocessing'
import { RandomForest } from '@/lib/model'

function vectored(dataset: { text: string; sentiment: string }[], topN: number = 20) {
  // Initialize TF-IDF
  const tfidf = new TfIdf()
  dataset.forEach((item) => tfidf.addDocument(item.text))

  // Extract and sort TF-IDF features by importance using Map
  const featureScores = new Map<string, number>()

  dataset.forEach((_, index) => {
    tfidf.listTerms(index).forEach((term) => {
      featureScores.set(term.term, (featureScores.get(term.term) || 0) + term.tfidf)
    })
  })

  // Sort terms by importance and select top N features

  const selectedFeatures = [...featureScores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map((f) => f[0])

  // Transform dataset to TF-IDF feature vectors with normalization
  const featureVectors = dataset.map((item, index) => {
    let vector = selectedFeatures.map((word) => tfidf.tfidf(word, index) || 0)

    // Normalize vector (Euclidean norm)
    const norm = Math.sqrt(vector.reduce((sum, val) => sum + val ** 2, 0)) || 1
    vector = vector.map((v) => v / norm)

    return { feature: vector, label: item.sentiment === 'positive' ? 1 : 0 }
  })

  return featureVectors
}

function randomOversampled(featureVectors: Vector[]) {
  const y = featureVectors.map((item) => item.label)

  const classCounts: Record<number, number> = {}
  y.forEach((label) => {
    classCounts[label] = (classCounts[label] || 0) + 1
  })

  const maxCount = Math.max(...Object.values(classCounts))
  const resampledVectors: Vector[] = []

  const dataByClass: Record<number, Vector[]> = {}
  featureVectors.forEach((vector) => {
    const label = vector.label
    if (!dataByClass[label]) {
      dataByClass[label] = []
    }
    dataByClass[label].push(vector)
  })

  Object.values(dataByClass).forEach((data) => {
    while (data.length < maxCount) {
      data.push(data[Math.floor(Math.random() * data.length)])
    }
    resampledVectors.push(...data)
  })

  return resampledVectors
}

function smoteOversampled(featureVectors: Vector[]) {
  const x = featureVectors.map((item) => item.feature)
  const y = featureVectors.map((item) => item.label)

  const minorityClass = y.reduce((a, b) => a + b, 0) < y.length / 2 ? 1 : 0
  const majorityClass = 1 - minorityClass

  const x_minority = x.filter((_, i) => y[i] === minorityClass)
  const x_majority = x.filter((_, i) => y[i] === majorityClass)

  const diff = x_majority.length - x_minority.length
  const syntheticSamples: Vector[] = []

  for (let i = 0; i < diff; i++) {
    const idx = Math.floor(Math.random() * x_minority.length)
    const neighborIdx = Math.floor(Math.random() * x_minority.length)
    const newSample = x_minority[idx].map((val, j) => val + Math.random() * (x_minority[neighborIdx][j] - val))
    syntheticSamples.push({ feature: newSample, label: minorityClass })
  }

  const resampled = [...featureVectors, ...syntheticSamples]

  return resampled
}

function splited(x: number[][], y: number[], test_size: number = 0.2) {
  // Train-test split (80% train, 20% test)
  const testCount = Math.floor(x.length * test_size)
  const x_test = x.slice(0, testCount)
  const y_test = y.slice(0, testCount)
  const x_train = x.slice(testCount)
  const y_train = y.slice(testCount)
  return { x_train, y_train, x_test, y_test }
}

function analyzed(x_train: number[][], y_train: number[], x_test: number[][], y_test: number[], n_estimators: number = 100, tree_depth: number = 5) {
  // Train Random Forest Classifier
  const model = new RandomForest(n_estimators, tree_depth)
  model.train(x_train, y_train)
  // Evaluate the model
  const predictions = model.predict(x_test)

  const tp = predictions.filter((pred, i) => pred === 1 && y_test[i] === 1).length
  const tn = predictions.filter((pred, i) => pred === 0 && y_test[i] === 0).length
  const fp = predictions.filter((pred, i) => pred === 1 && y_test[i] === 0).length
  const fn = predictions.filter((pred, i) => pred === 0 && y_test[i] === 1).length

  const accuracy = (tp + tn) / y_test.length
  const precision = tp / (tp + fp)
  const recall = tp / (tp + fn)
  const f1_score = (2 * (precision * recall)) / (precision + recall)

  return {
    accuracy: (accuracy * 100).toFixed(2),
    precision: (precision * 100).toFixed(2),
    recall: (recall * 100).toFixed(2),
    f1_score: (f1_score * 100).toFixed(2),
    confusion_matrix: {
      tp,
      tn,
      fp,
      fn,
    },
  }
}

export async function preprocessing(data: Post[]) {
  const texts = data.map((e) => {
    const text = new Preprocessing(e.text)
    const clean = text.clean().print()
    const stem = text.stem().print()
    const stopword = text.stopword().print()
    return { ...e, clean, stem, stopword }
  })
  return texts
}

export async function vectoring(texts: Preprocessed[], max_features: string) {
  const data = texts.map((e) => {
    return { text: e.stopword, sentiment: e.sentiment }
  })
  return vectored(data, parseInt(max_features))
}

export async function oversampling(vector: Vector[], options: string) {
  return options === 'smote' ? smoteOversampled(vector) : randomOversampled(vector)
}

export async function evaluating(vector: Vector[], options: { test_size?: number; n_estimators?: number; tree_depth?: number }) {
  const { test_size = 0.2, n_estimators = 100, tree_depth = 5 } = options
  const x = vector.map((item) => item.feature)
  const y = vector.map((item) => item.label)
  const { x_train, y_train, x_test, y_test } = splited(x, y, test_size)
  return analyzed(x_train, y_train, x_test, y_test, n_estimators, tree_depth)
}
