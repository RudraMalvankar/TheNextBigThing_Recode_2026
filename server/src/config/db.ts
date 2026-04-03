import mongoose from "mongoose";
console.log("ENV CHECK:", process.env.MONGODB_URI);
type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

global.mongooseCache = cached;

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  const mongoUri = process.env.MONGODB_URI ?? process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI or MONGO_URI is not set");
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(mongoUri, {
        bufferCommands: false,
      })
      .catch((error) => {
        cached.promise = null;
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
