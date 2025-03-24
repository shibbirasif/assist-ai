import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity()
export class Session {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "text" })
    userId!: string;

    @Column({ type: "text" })
    messages!: string;

    @CreateDateColumn()
    createdAt!: Date;
}
