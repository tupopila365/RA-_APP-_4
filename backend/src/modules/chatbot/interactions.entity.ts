import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('chatbot_interactions')
@Index(['timestamp'])
@Index(['feedback'])
@Index(['category'])
@Index(['sessionId'])
@Index(['createdAt'])
export class ChatbotInteraction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('nvarchar', { length: 'MAX' })
  question: string;

  @Column('nvarchar', { length: 'MAX' })
  answer: string;

  @Column({ type: 'nvarchar', length: 20, nullable: true })
  feedback: 'like' | 'dislike' | null;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  comment: string | null;

  @Column({ type: 'datetime' })
  timestamp: Date;

  @Column({ type: 'varchar', length: 255 })
  sessionId: string;

  @Column({ type: 'varchar', length: 100, default: 'general' })
  category: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

