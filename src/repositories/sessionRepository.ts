import { Session } from "../entities/Session";
import { AppDataSource } from "../config/database";

export const sessionRepository = AppDataSource.getRepository(Session);
