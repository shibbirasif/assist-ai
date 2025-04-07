import "reflect-metadata";
import { DataSource } from "typeorm";
import { ChatSession } from "../entities/ChatSession";
import * as dotenv from 'dotenv';
import path from "path";

dotenv.config();

const dbName = process.env.NODE_ENV === 'test' ? process.env.TEST_DB_PATH : process.env.DB_PATH;
const dbPath = path.resolve(__dirname, "../../db", dbName || "database.sqlite");

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: dbPath,
    synchronize: true,
    logging: false,
    entities: [ChatSession],
    migrations: [],
    subscribers: [],
});