import { DataSource } from "typeorm";
import path from "path";

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: path.resolve(__dirname, "../../db/database.sqlite"),
    synchronize: true,
    logging: false,
    entities: ["src/entities/*.ts"],
});

export const initializeDatabase = async () => {
    try {
        await AppDataSource.initialize();
        console.log("Database connected");
    } catch (error) {
        console.error("Database connection error", error);
    }
}