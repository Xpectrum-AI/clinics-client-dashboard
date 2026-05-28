import { MongoClient } from "mongodb"

export async function getDb() {
  const uri = process.env.MONGODB_URI || "mongodb+srv://mongo_access:3gfaAKMQsCwEjIXG@clusterprod.jp8u9.mongodb.net/?appName=ClusterProd"
  const dbName = process.env.MONGODB_DB || "clinics"
  if (!uri) throw new Error("Missing MONGODB_URI env var")
  if (!dbName) throw new Error("Missing MONGODB_DB env var")

  if (!globalThis._mongoClient) {
    globalThis._mongoClient = new MongoClient(uri)
    globalThis._mongoConnect = globalThis._mongoClient.connect()
  }
  await globalThis._mongoConnect
  return globalThis._mongoClient.db(dbName)
}
