import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { Event } from '../../event/entities/event.entity';

export enum ReservationStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Cancelled = 'cancelled',
}

@Entity('reservations')
@Unique(['userId', 'eventId']) // Prevent duplicate reservations
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Event, (event) => event.reservations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column()
  eventId: number;

  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.Pending,
  })
  status: ReservationStatus;

  @Column({ default: 1 })
  numberOfTickets: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
