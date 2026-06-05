import { PrismaClient } from "../../../packages/database/generated/prisma";
import * as dotenv from "dotenv";

dotenv.config();

export const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});
