class DecisionTree {
  private featureIndex: number = 0
  private threshold: number = 0
  private left: DecisionTree | null = null
  private right: DecisionTree | null = null
  private label: number | null = null

  train(X: number[][], y: number[], depth: number = 5): void {
    if (depth === 0 || y.every((label) => label === y[0])) {
      this.label = y[0]
      return
    }

    let bestFeature = 0
    let bestThreshold = 0
    let bestGini = 1
    let bestLeftX: number[][] = []
    let bestRightX: number[][] = []
    let bestLeftY: number[] = []
    let bestRightY: number[] = []

    for (let feature = 0; feature < X[0].length; feature++) {
      const values = [...new Set(X.map((row) => row[feature]))]
      for (const threshold of values) {
        const leftIndexes = X.map((row, i) => (row[feature] <= threshold ? i : -1)).filter((i) => i !== -1)
        const rightIndexes = X.map((row, i) => (row[feature] > threshold ? i : -1)).filter((i) => i !== -1)
        const leftY = leftIndexes.map((i) => y[i])
        const rightY = rightIndexes.map((i) => y[i])
        const gini = this.calculateGini(leftY, rightY)
        if (gini < bestGini) {
          bestGini = gini
          bestFeature = feature
          bestThreshold = threshold
          bestLeftX = leftIndexes.map((i) => X[i])
          bestRightX = rightIndexes.map((i) => X[i])
          bestLeftY = leftY
          bestRightY = rightY
        }
      }
    }

    if (bestLeftX.length === 0 || bestRightX.length === 0) {
      this.label = y[0]
      return
    }

    this.featureIndex = bestFeature
    this.threshold = bestThreshold
    this.left = new DecisionTree()
    this.right = new DecisionTree()
    this.left.train(bestLeftX, bestLeftY, depth - 1)
    this.right.train(bestRightX, bestRightY, depth - 1)
  }

  predict(features: number[][]): number[] {
    return features.map((feature) => {
      if (this.label !== null) return this.label
      return feature[this.featureIndex] <= this.threshold ? this.left!.predict([feature])[0] : this.right!.predict([feature])[0]
    })
  }

  private calculateGini(leftY: number[], rightY: number[]): number {
    const total = leftY.length + rightY.length
    const gini = (group: number[]) => {
      const proportions = [0, 1].map((label) => group.filter((y) => y === label).length / group.length)
      return 1 - proportions.reduce((sum, p) => sum + p ** 2, 0)
    }
    return (leftY.length / total) * gini(leftY) + (rightY.length / total) * gini(rightY)
  }
}

export class RandomForest {
  private trees: DecisionTree[] = []
  private numTrees: number
  private maxDepth: number

  constructor(numTrees: number = 10, maxDepth: number = 5) {
    this.numTrees = numTrees
    this.maxDepth = maxDepth
  }

  train(X: number[][], y: number[]): void {
    for (let i = 0; i < this.numTrees; i++) {
      const { sampleX, sampleY } = this.bootstrapSample(X, y)
      const tree = new DecisionTree()
      tree.train(sampleX, sampleY, this.maxDepth)
      this.trees.push(tree)
    }
  }

  predict(features: number[][]): number[] {
    const predictions = this.trees.map((tree) => tree.predict(features))
    return predictions[0].map((_, i) => {
      const votes = predictions.map((pred) => pred[i])
      return votes.reduce((a, b) => a + b, 0) > this.trees.length / 2 ? 1 : 0
    })
  }

  private bootstrapSample(X: number[][], y: number[]): { sampleX: number[][]; sampleY: number[] } {
    const sampleX: number[][] = []
    const sampleY: number[] = []
    for (let i = 0; i < X.length; i++) {
      const idx = Math.floor(Math.random() * X.length)
      sampleX.push(X[idx])
      sampleY.push(y[idx])
    }
    return { sampleX, sampleY }
  }
}
