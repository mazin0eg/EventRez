import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event } from './entities/event.entity';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    const event = this.eventRepository.create({
      title: createEventDto.title,
      description: createEventDto.description,
      location: createEventDto.location,
      organizerId: createEventDto.organizerId,
      categoryId: createEventDto.categoryId,
      image: createEventDto.image,
      capacity: createEventDto.capacity,
      isPublished: createEventDto.isPublished ?? false,
      startDate: new Date(createEventDto.startDate),
      endDate: createEventDto.endDate
        ? new Date(createEventDto.endDate)
        : undefined,
    });
    return this.eventRepository.save(event);
  }

  async findAll(): Promise<Event[]> {
    return this.eventRepository.find({
      relations: ['organizer', 'category'],
      order: { startDate: 'ASC' },
    });
  }

  async findPublished(): Promise<Event[]> {
    return this.eventRepository.find({
      where: { isPublished: true },
      relations: ['organizer', 'category'],
      order: { startDate: 'ASC' },
    });
  }

  async togglePublish(id: number): Promise<Event> {
    const event = await this.findOne(id);
    event.isPublished = !event.isPublished;
    return this.eventRepository.save(event);
  }

  async findOne(id: number): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['organizer', 'category'],
    });
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return event;
  }

  async update(id: number, updateEventDto: UpdateEventDto): Promise<Event> {
    const event = await this.findOne(id);

    if (updateEventDto.title !== undefined) {
      event.title = updateEventDto.title;
    }
    if (updateEventDto.description !== undefined) {
      event.description = updateEventDto.description;
    }
    if (updateEventDto.location !== undefined) {
      event.location = updateEventDto.location;
    }
    if (updateEventDto.organizerId !== undefined) {
      event.organizerId = updateEventDto.organizerId;
    }
    if (updateEventDto.categoryId !== undefined) {
      event.categoryId = updateEventDto.categoryId;
    }
    if (updateEventDto.capacity !== undefined) {
      event.capacity = updateEventDto.capacity;
    }
    if (updateEventDto.isPublished !== undefined) {
      event.isPublished = updateEventDto.isPublished;
    }
    if (updateEventDto.startDate) {
      event.startDate = new Date(updateEventDto.startDate);
    }
    if (updateEventDto.endDate) {
      event.endDate = new Date(updateEventDto.endDate);
    }

    return this.eventRepository.save(event);
  }

  async remove(id: number): Promise<{ message: string }> {
    const event = await this.findOne(id);
    await this.eventRepository.remove(event);
    return { message: `Event with ID ${id} has been deleted` };
  }
}
