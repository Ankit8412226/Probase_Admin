import mongoose from "mongoose";

// Global plugin to automatically inject tenantId field with index on all Mongoose schemas
mongoose.plugin((schema) => {
  if (!schema.paths.tenantId) {
    schema.add({
      tenantId: {
        type: String,
        required: false,
        default: "demo_tenant",
        index: true,
      },
    });
  }
});

declare global {
  var mongooseCache:
    | {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
      }
    | undefined;
}

function getMongoUri() {
  return process.env.MONGODB_URI?.trim();
}

export function hasMongoConnection() {
  return Boolean(getMongoUri());
}

export async function connectToDatabase() {
  const uri = getMongoUri();
  if (!uri) {
    return null;
  }

  if (!global.mongooseCache) {
    global.mongooseCache = { conn: null, promise: null };
  }

  if (global.mongooseCache.conn) {
    return global.mongooseCache.conn;
  }

  if (!global.mongooseCache.promise) {
    global.mongooseCache.promise = mongoose.connect(uri, {
      bufferCommands: false,
    });
  }

  global.mongooseCache.conn = await global.mongooseCache.promise;
  return global.mongooseCache.conn;
}
