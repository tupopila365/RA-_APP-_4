import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";

@Entity("feedback")
@Index(["category"])
@Index(["status"])
@Index(["createdAt"])
export class Feedback {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 100 })
  category: string;

  @Column({ type: "nvarchar", length: "MAX" })
  message: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  email: string;

  @Column({ type: "varchar", length: 20, default: "new" })
  status: string;

  @Column({ type: "nvarchar", length: "MAX", nullable: true })
  adminNotes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
