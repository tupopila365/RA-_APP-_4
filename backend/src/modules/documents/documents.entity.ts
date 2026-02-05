import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../auth/auth.entity';

export type DocumentCategory = 'policy' | 'tender' | 'report' | 'other';

@Entity('documents')
@Index(['category'])
@Index(['indexed'])
@Index(['createdAt'])
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column('nvarchar', { length: 1000 })
  description: string;

  @Column({ type: 'varchar', length: 2000 })
  fileUrl: string;

  @Column({ type: 'varchar', length: 100, default: 'application/pdf' })
  fileType: string;

  @Column('int')
  fileSize: number;

  @Column({ type: 'nvarchar', length: 50 })
  category: DocumentCategory;

  @Column({ default: false })
  indexed: boolean;

  @Column('int')
  uploadedById: number;

  @ManyToOne(() => User, (user) => user.documents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'uploadedById' })
  uploadedBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

