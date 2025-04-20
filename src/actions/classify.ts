'use server'

import { TfIdf } from 'natural'
import { Preprocessing } from '@/lib/preprocessing'
import { RandomForest } from '@/lib/model'
import { ObjectId } from 'mongodb'
import { bulk } from './functions'

function vectored(dataset: string[], corpus: string[], topN: number = 20) {
  // Initialize TF-IDF
  const tfidf = new TfIdf()
  corpus.forEach((text) => tfidf.addDocument(text))

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
  const featureVectors = dataset.map((text, index) => {
    let vector = selectedFeatures.map((word) => tfidf.tfidf(word, index) || 0)

    // Normalize vector (Euclidean norm)
    const norm = Math.sqrt(vector.reduce((sum, val) => sum + val ** 2, 0)) || 1
    vector = vector.map((v) => v / norm)

    return { feature: vector }
  })

  return featureVectors
}

function classified(x_train: number[][], y_train: number[], x_test: number[][], n_estimators: number = 100, tree_depth: number = 5) {
  // Train Random Forest Classifier
  const model = new RandomForest(n_estimators, tree_depth)
  model.train(x_train, y_train)
  // Evaluate the model
  const predictions = model.predict(x_test)
  return predictions
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

export async function vectoring(data: Preprocessed[], corpus: string[], max_features: string) {
  const texts = data.map((e) => e.stopword)
  const featureVectors = vectored(texts, corpus, parseInt(max_features))
  const newData = data.map((e, i) => ({ _id: e._id, feature: featureVectors[i].feature }))
  return newData
}

export async function classifying(data: { _id: string; feature: number[] }[], model: Vector[], options: { n_estimators?: number; tree_depth?: number }) {
  const { n_estimators = 100, tree_depth = 5 } = options
  const x_test = data.map((e) => e.feature)
  const x_train = model.map((e) => e.feature)
  const y_train = model.map((e) => e.label)
  const y_test = classified(x_train, y_train, x_test, n_estimators, tree_depth)
  const newData = data.map((e, i) => ({ ...e, label: y_test[i] }))
  return newData
}

export async function saving(data: Post[]) {
  const operations = data.map((e) => {
    return {
      updateOne: {
        filter: { _id: new ObjectId(e._id) },
        update: { $set: { sentiment: e.sentiment } },
        upsert: true,
      },
    }
  })
  return await bulk('main', 'post', operations)
}
