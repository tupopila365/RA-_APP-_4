import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('forms')
@Index(['category'])
@Index(['published'])
@Index(['createdAt'])
@Index(['publishedAt'])
export class Form {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'nvarchar', length: 100 })
  category: 'Procurement' | 'Roads & Infrastructure' | 'Plans & Strategies' | 'Conferences & Events' | 'Legislation & Policy';

  @Column('simple-json')
  documents: Array<{ title: string; url: string; fileName: string }>;

  @Column({ default: false })
  published: boolean;

  @Column({ type: 'datetime', nullable: true })
  publishedAt: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  createdBy: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

