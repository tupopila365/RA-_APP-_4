import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('push_tokens')
@Index(['userId'])
@Index(['active'])
export class PushToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int', { nullable: true })
  userId: number | null;

  @Column({ type: 'varchar', length: 500, unique: true })
  pushToken: string;

  @Column({ type: 'nvarchar', length: 20 })
  platform: 'ios' | 'android';

  @Column('simple-json', { nullable: true })
  deviceInfo: {
    brand?: string;
    modelName?: string;
    osName?: string;
    osVersion?: string;
  } | null;

  @Column({ default: true })
  active: boolean;

  @Column({ type: 'datetime' })
  lastUsed: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('notification_logs')
@Index(['type', 'sentAt'])
@Index(['relatedId'])
@Index(['jobId'])
export class NotificationLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 500 })
  title: string;

  @Column('nvarchar', { length: 'MAX' })
  body: string;

  @Column('simple-json', { nullable: true })
  data: Record<string, unknown> | null;

  @Column('simple-json')
  recipients: string[];

  @Column('int', { default: 0 })
  sentCount: number;

  @Column('int', { default: 0 })
  failedCount: number;

  @Column({ type: 'nvarchar', length: 20 })
  type: 'news' | 'tender' | 'vacancy' | 'general';

  @Column({ type: 'varchar', length: 100, nullable: true })
  relatedId: string | null;

  @Column('int', { nullable: true })
  sentById: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  jobId: string | null;

  @Column({ type: 'nvarchar', length: 20, nullable: true })
  status: 'queued' | 'sent' | 'failed' | 'partial' | null;

  @Column('simple-json', { nullable: true })
  platforms: ('ios' | 'android')[] | null;

  @Column({ type: 'datetime', nullable: true })
  scheduledAt: Date | null;

  @Column({ type: 'datetime' })
  sentAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}

