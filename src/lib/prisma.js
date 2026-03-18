// Create a prisma client for the current user's session
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();