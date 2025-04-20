//@ts-expect-error package doesn't include types
import { Stemmer, Tokenizer } from 'sastrawijs'
//@ts-expect-error package doesn't include types
import { removeStopwords, ind } from 'stopword'

export class Preprocessing {
  private text: string

  constructor(text: string) {
    this.text = text
  }

  public clean(): this {
    this.text = this.text
      .toLowerCase()
      .replace(/@\w+/g, '') // Remove @username mentions
      .replace(/#\w+/g, '') // Remove hashtags
      .replace(/https?:\/\/\S+/g, '') // Remove URLs
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
      .trim()

    return this
  }

  public stem(): this {
    const stemmer = new Stemmer()
    const tokenizer = new Tokenizer()
    const words = tokenizer.tokenize(this.text)
    this.text = words.map((word: string) => stemmer.stem(word)).join(' ')
    return this
  }

  public stopword(): this {
    const tokenizer = new Tokenizer()
    const words = tokenizer.tokenize(this.text)
    this.text = removeStopwords(words, ind).join(' ')
    return this
  }

  public print(): string {
    return this.text
  }
}
