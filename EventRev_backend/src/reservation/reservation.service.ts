import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation, ReservationStatus } from './entities/reservation.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { Event } from '../event/entities/event.entity';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async create(
    userId: number,
    createReservationDto: CreateReservationDto,
  ): Promise<Reservation> {
    const { eventId, numberOfTickets = 1, notes } = createReservationDto;

    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    // Check if event has already started
    if (new Date(event.startDate) < new Date()) {
      throw new BadRequestException('Cannot reserve a past event');
    }

    // Check if user already has a reservation for this event
    const existingReservation = await this.reservationRepository.findOne({
      where: { userId, eventId },
    });

    if (
      existingReservation &&
      (existingReservation.status === ReservationStatus.Pending ||
        existingReservation.status === ReservationStatus.Confirmed)
    ) {
      throw new ConflictException(
        'You already have a reservation for this event',
      );
    }

    // Check event capacity if it exists
    if (event.capacity !== null && event.capacity !== undefined) {
      const totalReserved = await this.getTotalReservedTickets(eventId);
      const availableSpots = event.capacity - totalReserved;

      if (numberOfTickets > availableSpots) {
        throw new BadRequestException(
          `Not enough spots available. Only ${availableSpots} spots remaining.`,
        );
      }
    }

    // Create reservation with pending status (requires admin confirmation)
    if (!existingReservation) {
      const reservation = this.reservationRepository.create({
        userId,
        eventId,
        numberOfTickets,
        notes,
        status: ReservationStatus.Pending,
      });

      return this.reservationRepository.save(reservation);
    }
    existingReservation.numberOfTickets = numberOfTickets;
    existingReservation.status = ReservationStatus.Pending;

    return this.reservationRepository.save(existingReservation);
  }

  async findAllByUser(userId: number): Promise<Reservation[]> {
    return this.reservationRepository.find({
      where: { userId },
      relations: ['event', 'event.category'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllByEvent(eventId: number): Promise<Reservation[]> {
    return this.reservationRepository.find({
      where: { eventId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllPending(): Promise<Reservation[]> {
    return this.reservationRepository.find({
      where: { status: ReservationStatus.Pending },
      relations: ['user', 'event'],
      order: { createdAt: 'ASC' },
    });
  }

  async confirmReservation(id: number): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['event'],
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }

    if (reservation.status === ReservationStatus.Confirmed) {
      throw new BadRequestException('Reservation is already confirmed');
    }

    if (reservation.status === ReservationStatus.Cancelled) {
      throw new BadRequestException('Cannot confirm a cancelled reservation');
    }

    // Verify capacity before confirming
    const event = reservation.event;
    if (event.capacity !== null && event.capacity !== undefined) {
      const totalReserved = await this.getTotalConfirmedTickets(event.id);
      const availableSpots = event.capacity - totalReserved;

      if (reservation.numberOfTickets > availableSpots) {
        throw new BadRequestException(
          `Not enough spots available. Only ${availableSpots} spots remaining.`,
        );
      }
    }

    reservation.status = ReservationStatus.Confirmed;
    return this.reservationRepository.save(reservation);
  }

  async rejectReservation(id: number): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }

    if (reservation.status === ReservationStatus.Cancelled) {
      throw new BadRequestException('Reservation is already cancelled');
    }

    reservation.status = ReservationStatus.Cancelled;
    return this.reservationRepository.save(reservation);
  }

  private async getTotalConfirmedTickets(eventId: number): Promise<number> {
    const result = await this.reservationRepository
      .createQueryBuilder('reservation')
      .select('SUM(reservation.numberOfTickets)', 'total')
      .where('reservation.eventId = :eventId', { eventId })
      .andWhere('reservation.status = :status', {
        status: ReservationStatus.Confirmed,
      })
      .getRawOne<{ total: string | null }>();

    return parseInt(result?.total || '0', 10);
  }

  async findOne(id: number, userId: number): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['event', 'event.category', 'user'],
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }

    // Users can only view their own reservations
    if (reservation.userId !== userId) {
      throw new ForbiddenException('You can only view your own reservations');
    }

    return reservation;
  }

  async update(
    id: number,
    userId: number,
    updateReservationDto: UpdateReservationDto,
  ): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['event'],
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }

    // Users can only update their own reservations
    if (reservation.userId !== userId) {
      throw new ForbiddenException('You can only update your own reservations');
    }

    // Cannot update cancelled reservations
    if (reservation.status === ReservationStatus.Cancelled) {
      throw new BadRequestException('Cannot update a cancelled reservation');
    }

    // Check capacity if updating number of tickets
    if (updateReservationDto.numberOfTickets !== undefined) {
      const event = reservation.event;
      if (event.capacity !== null && event.capacity !== undefined) {
        const totalReserved = await this.getTotalReservedTickets(event.id);
        const currentTickets = reservation.numberOfTickets;
        const additionalTickets =
          updateReservationDto.numberOfTickets - currentTickets;
        const availableSpots = event.capacity - totalReserved;

        if (additionalTickets > availableSpots) {
          throw new BadRequestException(
            `Not enough spots available. Only ${availableSpots} additional spots remaining.`,
          );
        }
      }
    }

    Object.assign(reservation, updateReservationDto);
    return this.reservationRepository.save(reservation);
  }

  async cancel(id: number, userId: number): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }

    // Users can only cancel their own reservations
    if (reservation.userId !== userId) {
      throw new ForbiddenException('You can only cancel your own reservations');
    }

    if (reservation.status === ReservationStatus.Cancelled) {
      throw new BadRequestException('Reservation is already cancelled');
    }

    reservation.status = ReservationStatus.Cancelled;
    return this.reservationRepository.save(reservation);
  }

  async remove(id: number, userId: number): Promise<void> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }

    // Users can only delete their own reservations
    if (reservation.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reservations');
    }

    await this.reservationRepository.remove(reservation);
  }

  async getEventAvailability(eventId: number): Promise<{
    capacity: number | null;
    reserved: number;
    available: number | null;
  }> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    const reserved = await this.getTotalReservedTickets(eventId);

    return {
      capacity: event.capacity,
      reserved,
      available: event.capacity !== null ? event.capacity - reserved : null,
    };
  }

  private async getTotalReservedTickets(eventId: number): Promise<number> {
    const result = await this.reservationRepository
      .createQueryBuilder('reservation')
      .select('SUM(reservation.numberOfTickets)', 'total')
      .where('reservation.eventId = :eventId', { eventId })
      .andWhere('reservation.status != :status', {
        status: ReservationStatus.Cancelled,
      })
      .getRawOne<{ total: string | null }>();

    return parseInt(result?.total || '0', 10);
  }
}
