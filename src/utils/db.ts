import mongoose from "mongoose";
import "dotenv/config";

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) {
  console.error("MongoDB connection string is missing.");
  process.exit(1);
}

export const connectToDB = async () => {
  try {
    await mongoose.connect(DATABASE_URL);

    console.log("You were connected to DB successfully");
  } catch (e) {
    console.log("Unable to connect to DB", e);
  }
};
