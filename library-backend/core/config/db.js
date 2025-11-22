import { connect } from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const DB_CONNECTOR = process.env.DB_CONNECTOR;
const DB_HOST = process.env.MONGO_HOST || "127.0.0.1";
const DB_PORT = process.env.MONGO_PORT || 27017;
const DB_NAME = process.env.MONGO_DB_NAME;
const DB_USER = process.env.MONGO_DB_USER;
const DB_PASS = process.env.MONGO_DB_PASS;

const CONNECTION_STRING = `${DB_CONNECTOR}://${DB_HOST}:${DB_PORT}`;
const connectDb = () => {
  return connect(CONNECTION_STRING, {
    dbName: DB_NAME,
    maxPoolSize: 50,
  });
};

export default { connectDb };
