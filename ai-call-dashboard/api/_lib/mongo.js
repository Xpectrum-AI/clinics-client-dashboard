import { MongoClient } from "mongodb"

const dbName = process.env.MONGODB_DB || "clinics"

export async function getDb() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error("Missing MONGODB_URI env var")

  if (!globalThis._mongoClient) {
    globalThis._mongoClient = new MongoClient(uri)
    globalThis._mongoConnect = globalThis._mongoClient.connect()
  }
  await globalThis._mongoConnect
  return globalThis._mongoClient.db(dbName)
}
