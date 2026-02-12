import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('movies')
export class Movie {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  thumbnail: string;

  @Column()
  backdrop: string;

  @Column('simple-array')
  genres: string[];

  @Column()
  duration: number; // in minutes

  @Column({ type: 'varchar', length: 255, nullable: true })
  releaseDate: string;

  @Column('decimal', { precision: 3, scale: 1, default: 0 })
  rating: number;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ nullable: true })
  videoUrl: string; // HLS manifest URL

  @Column({ nullable: true })
  trailerUrl: string;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ default: false })
  isPremium: boolean;

  @Column('simple-array', { nullable: true })
  cast: string[];

  @Column('simple-array', { nullable: true })
  directors: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
