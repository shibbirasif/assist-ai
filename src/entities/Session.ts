import { Message } from "ollama";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Session {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "text" })
    userId!: string;

    @Column()
    model!: string;

    @Column({ type: "simple-json", nullable: true })
    messages: Message[] = [];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
