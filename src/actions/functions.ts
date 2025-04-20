'use server'

import { MongoClient, ObjectId } from 'mongodb'

const client = new MongoClient(process.env.MONGO_URI as string)

/* eslint-disable  @typescript-eslint/no-explicit-any */
export async function index(dbName: string, tbName: string, filter: any = {}) {
  try {
    await client.connect()
    const db = client.db(dbName)
    const collection = db.collection(tbName)
    const result = await collection.find(filter).toArray()
    console.log(`(db:${dbName}) (collection:${tbName}) -> index`)
    await client.close()
    return JSON.parse(JSON.stringify(result))
  } catch (error) {
    console.log(error)
  }
}

export async function indexRandom(dbName: string, tbName: string, size: number) {
  try {
    await client.connect()
    const db = client.db(dbName)
    const collection = db.collection(tbName)
    const result = await collection.aggregate([{ $sample: { size } }]).toArray()
    console.log(`(db:${dbName}) (collection:${tbName}) -> index random`)
    await client.close()
    return JSON.parse(JSON.stringify(result))
  } catch (error) {
    console.log(error)
  }
}

/* eslint-disable  @typescript-eslint/no-explicit-any */
export async function count(dbName: string, tbName: string, filter: any = {}) {
  try {
    await client.connect()
    const db = client.db(dbName)
    const collection = db.collection(tbName)
    const result = await collection?.countDocuments(filter)
    console.log(`(db:${dbName}) (collection:${tbName}) -> count`)
    await client.close()
    return result
  } catch (error) {
    console.log(error)
  }
}

export async function get(dbName: string, tbName: string, id: string) {
  try {
    await client.connect()
    const db = client.db(dbName)
    const collection = db.collection(tbName)
    const _id = new ObjectId(id)
    const result = await collection?.findOne({ _id })
    console.log(`(db:${dbName}) (collection:${tbName}) -> get`)
    await client.close()
    return result
  } catch (error) {
    console.log(error)
  }
}

/* eslint-disable  @typescript-eslint/no-explicit-any */
export async function store(dbName: string, tbName: string, data: any) {
  try {
    await client.connect()
    const db = client.db(dbName)
    const collection = db.collection(tbName)
    await collection?.insertOne(data)
    console.log(`(db:${dbName}) (collection:${tbName}) -> store`)
    await client.close()
    return { message: `Successfully create ${tbName}` }
  } catch (error) {
    console.log(error)
  }
}

/* eslint-disable  @typescript-eslint/no-explicit-any */
export async function storeMany(dbName: string, tbName: string, data: any[]) {
  try {
    await client.connect()
    const db = client.db(dbName)
    const collection = db.collection(tbName)
    await collection?.insertMany(data)
    console.log(`(db:${dbName}) (collection:${tbName}) -> store many`)
    await client.close()
    return { message: `Successfully create many ${tbName}` }
  } catch (error) {
    console.log(error)
  }
}

/* eslint-disable  @typescript-eslint/no-explicit-any */
export async function update(dbName: string, tbName: string, id: string, data: any) {
  try {
    await client.connect()
    const db = client.db(dbName)
    const collection = db.collection(tbName)
    const _id = new ObjectId(id)
    await collection?.updateOne({ _id }, { $set: data })
    console.log(`(db:${dbName}) (collection:${tbName}) -> update`)
    await client.close()
    return { message: `Successfully edit ${tbName}` }
  } catch (error) {
    console.log(error)
  }
}

export async function destroy(dbName: string, tbName: string, id: string) {
  try {
    await client.connect()
    const db = client.db(dbName)
    const collection = db.collection(tbName)
    const _id = new ObjectId(id)
    await collection?.deleteOne({ _id })
    console.log(`(db:${dbName}) (collection:${tbName}) -> destroy`)
    await client.close()
    return { message: `Successfully delete ${tbName}` }
  } catch (error) {
    console.log(error)
  }
}

/* eslint-disable  @typescript-eslint/no-explicit-any */
export async function destroyMany(dbName: string, tbName: string, filter: any = {}) {
  try {
    await client.connect()
    const db = client.db(dbName)
    const collection = db.collection(tbName)
    await collection?.deleteMany(filter)
    console.log(`(db:${dbName}) (collection:${tbName}) -> destroy many`)
    await client.close()
    return { message: `Successfully delete many ${tbName}` }
  } catch (error) {
    console.log(error)
  }
}

/* eslint-disable  @typescript-eslint/no-explicit-any */
export async function bulk(dbName: string, tbName: string, operations: any = []) {
  try {
    await client.connect()
    const db = client.db(dbName)
    const collection = db.collection(tbName)
    await collection.bulkWrite(operations)
    console.log(`(db:${dbName}) (collection:${tbName}) -> bulk`)
    await client.close()
    return { message: `Successfully bulk operations ${tbName}` }
  } catch (error) {
    console.log(error)
  }
}
