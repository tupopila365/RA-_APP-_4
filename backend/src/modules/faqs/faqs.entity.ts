import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('faqs')
@Index(['category'])
@Index(['order'])
@Index(['createdAt'])
export class FAQ {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('nvarchar', { length: 'MAX' })
  question: string;

  @Column('nvarchar', { length: 'MAX' })
  answer: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string | null;

  @Column({ type: 'int', default: 0 })
  order: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

