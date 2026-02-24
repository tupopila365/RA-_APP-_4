import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/** Categories matching the mobile app Downloads screen. */
export const FORM_DOWNLOAD_CATEGORIES = [
  'Permits',
  'Procurement',
  'Reports',
  'Manuals',
  'Plans',
  'Legislation',
] as const;

export type FormDownloadCategory = (typeof FORM_DOWNLOAD_CATEGORIES)[number];

/**
 * One downloadable form/document as shown on the app Downloads screen.
 * Admin is structured the same: title, description, category, single PDF URL.
 */
@Entity('form_downloads')
@Index(['category'])
@Index(['published'])
@Index(['createdAt'])
export class FormDownload {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'nvarchar', length: 300 })
  title: string;

  @Column({ type: 'nvarchar', length: 1000, nullable: true })
  description: string | null;

  @Column({ type: 'nvarchar', length: 100 })
  category: string;

  @Column({ type: 'nvarchar', length: 2000 })
  pdfUrl: string;

  @Column({ default: true })
  published: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
