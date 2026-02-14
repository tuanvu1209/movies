import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('watch_progress')
@Index(['userId', 'movieId'], { unique: true })
export class WatchProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 512 })
  movieId: string;

  @Column('int', { default: 1 })
  episode: number;

  @Column('int', { default: 0 })
  currentTimeSeconds: number;

  @Column({ type: 'bigint' })
  updatedAt: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  title: string;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  thumbnail: string;

  @Column('int', { nullable: true })
  durationSeconds: number;
}
