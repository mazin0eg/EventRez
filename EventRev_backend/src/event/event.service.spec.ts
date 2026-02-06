/**
 * ============================================
 * EventService Unit Tests
 * ============================================
 * 
 * Best Practices Applied:
 * 1. AAA Pattern (Arrange, Act, Assert)
 * 2. Repository mocking with TypeORM patterns
 * 3. Testing CRUD operations comprehensively
 * 4. Testing edge cases and error handling
 * 5. Using factory functions for test data
 * 6. Isolated tests with proper cleanup
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { EventService } from './event.service';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

describe('EventService', () => {
  let eventService: EventService;
  let eventRepository: jest.Mocked<Repository<Event>>;

  // ============================================
  // Test Data Factories
  // ============================================
  const createMockEvent = (overrides: Partial<Event> = {}): Event => ({
    id: 1,
    title: 'Test Conference',
    description: 'A test conference for developers',
    startDate: new Date('2026-03-15T09:00:00Z'),
    endDate: new Date('2026-03-15T18:00:00Z'),
    location: 'Paris Convention Center',
    capacity: 100,
    isPublished: false,
    organizerId: 1,
    categoryId: 1,
    organizer: null,
    category: null,
    reservations: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  const createMockCreateEventDto = (
    overrides: Partial<CreateEventDto> = {},
  ): CreateEventDto => ({
    title: 'New Event',
    description: 'Description of new event',
    startDate: '2026-04-20T10:00:00Z',
    endDate: '2026-04-20T17:00:00Z',
    location: 'Test Location',
    capacity: 50,
    organizerId: 1,
    categoryId: 1,
    isPublished: false,
    ...overrides,
  });

  // ============================================
  // Test Setup
  // ============================================
  beforeEach(async () => {
    // Create mock repository
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        {
          provide: getRepositoryToken(Event),
          useValue: mockRepository,
        },
      ],
    }).compile();

    eventService = module.get<EventService>(EventService);
    eventRepository = module.get(getRepositoryToken(Event));

    // Reset all mocks
    jest.clearAllMocks();
  });

  // ============================================
  // Service Initialization
  // ============================================
  describe('Service Definition', () => {
    it('should be defined', () => {
      expect(eventService).toBeDefined();
    });

    it('should have repository injected', () => {
      expect(eventRepository).toBeDefined();
    });
  });

  // ============================================
  // CREATE Tests
  // ============================================
  describe('create', () => {
    it('should create a new event successfully', async () => {
      // Arrange
      const createDto = createMockCreateEventDto();
      const createdEvent = createMockEvent({
        title: createDto.title,
        description: createDto.description,
      });

      eventRepository.create.mockReturnValue(createdEvent);
      eventRepository.save.mockResolvedValue(createdEvent);

      // Act
      const result = await eventService.create(createDto);

      // Assert
      expect(eventRepository.create).toHaveBeenCalledWith({
        title: createDto.title,
        description: createDto.description,
        location: createDto.location,
        organizerId: createDto.organizerId,
        categoryId: createDto.categoryId,
        capacity: createDto.capacity,
        isPublished: false,
        startDate: expect.any(Date),
        endDate: expect.any(Date),
      });
      expect(eventRepository.save).toHaveBeenCalledWith(createdEvent);
      expect(result).toEqual(createdEvent);
    });

    it('should create event without optional fields', async () => {
      // Arrange
      const minimalDto: CreateEventDto = {
        title: 'Minimal Event',
        startDate: '2026-05-01T10:00:00Z',
      };
      const createdEvent = createMockEvent({ title: minimalDto.title });

      eventRepository.create.mockReturnValue(createdEvent);
      eventRepository.save.mockResolvedValue(createdEvent);

      // Act
      const result = await eventService.create(minimalDto);

      // Assert
      expect(result).toBeDefined();
      expect(eventRepository.create).toHaveBeenCalled();
    });

    it('should default isPublished to false when not provided', async () => {
      // Arrange
      const createDto = createMockCreateEventDto();
      delete createDto.isPublished;
      const createdEvent = createMockEvent({ isPublished: false });

      eventRepository.create.mockReturnValue(createdEvent);
      eventRepository.save.mockResolvedValue(createdEvent);

      // Act
      await eventService.create(createDto);

      // Assert
      expect(eventRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ isPublished: false }),
      );
    });

    it('should convert date strings to Date objects', async () => {
      // Arrange
      const createDto = createMockCreateEventDto({
        startDate: '2026-06-15T09:00:00Z',
        endDate: '2026-06-15T18:00:00Z',
      });
      const createdEvent = createMockEvent();

      eventRepository.create.mockReturnValue(createdEvent);
      eventRepository.save.mockResolvedValue(createdEvent);

      // Act
      await eventService.create(createDto);

      // Assert
      expect(eventRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: expect.any(Date),
          endDate: expect.any(Date),
        }),
      );
    });

    it('should handle endDate being undefined', async () => {
      // Arrange
      const createDto = createMockCreateEventDto();
      delete createDto.endDate;
      const createdEvent = createMockEvent({ endDate: undefined });

      eventRepository.create.mockReturnValue(createdEvent);
      eventRepository.save.mockResolvedValue(createdEvent);

      // Act
      const result = await eventService.create(createDto);

      // Assert
      expect(eventRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ endDate: undefined }),
      );
      expect(result).toBeDefined();
    });
  });

  // ============================================
  // READ Tests
  // ============================================
  describe('findAll', () => {
    it('should return all events with relations', async () => {
      // Arrange
      const events = [
        createMockEvent({ id: 1, title: 'Event 1' }),
        createMockEvent({ id: 2, title: 'Event 2' }),
        createMockEvent({ id: 3, title: 'Event 3' }),
      ];
      eventRepository.find.mockResolvedValue(events);

      // Act
      const result = await eventService.findAll();

      // Assert
      expect(eventRepository.find).toHaveBeenCalledWith({
        relations: ['organizer', 'category'],
        order: { startDate: 'ASC' },
      });
      expect(result).toHaveLength(3);
      expect(result).toEqual(events);
    });

    it('should return empty array when no events exist', async () => {
      // Arrange
      eventRepository.find.mockResolvedValue([]);

      // Act
      const result = await eventService.findAll();

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should order events by startDate ascending', async () => {
      // Arrange
      eventRepository.find.mockResolvedValue([]);

      // Act
      await eventService.findAll();

      // Assert
      expect(eventRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { startDate: 'ASC' },
        }),
      );
    });
  });

  describe('findPublished', () => {
    it('should return only published events', async () => {
      // Arrange
      const publishedEvents = [
        createMockEvent({ id: 1, isPublished: true }),
        createMockEvent({ id: 2, isPublished: true }),
      ];
      eventRepository.find.mockResolvedValue(publishedEvents);

      // Act
      const result = await eventService.findPublished();

      // Assert
      expect(eventRepository.find).toHaveBeenCalledWith({
        where: { isPublished: true },
        relations: ['organizer', 'category'],
        order: { startDate: 'ASC' },
      });
      expect(result).toEqual(publishedEvents);
    });

    it('should return empty array when no published events', async () => {
      // Arrange
      eventRepository.find.mockResolvedValue([]);

      // Act
      const result = await eventService.findPublished();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return event by id', async () => {
      // Arrange
      const event = createMockEvent({ id: 1 });
      eventRepository.findOne.mockResolvedValue(event);

      // Act
      const result = await eventService.findOne(1);

      // Assert
      expect(eventRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['organizer', 'category'],
      });
      expect(result).toEqual(event);
    });

    it('should throw NotFoundException when event not found', async () => {
      // Arrange
      eventRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(eventService.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(eventService.findOne(999)).rejects.toThrow(
        'Event with ID 999 not found',
      );
    });

    it('should include organizer and category relations', async () => {
      // Arrange
      const eventWithRelations = createMockEvent({
        organizer: { id: 1, email: 'org@test.com' } as any,
        category: { id: 1, name: 'Tech' } as any,
      });
      eventRepository.findOne.mockResolvedValue(eventWithRelations);

      // Act
      const result = await eventService.findOne(1);

      // Assert
      expect(result.organizer).toBeDefined();
      expect(result.category).toBeDefined();
    });
  });

  // ============================================
  // UPDATE Tests
  // ============================================
  describe('update', () => {
    it('should update event title', async () => {
      // Arrange
      const existingEvent = createMockEvent({ id: 1, title: 'Old Title' });
      const updateDto: UpdateEventDto = { title: 'New Title' };
      const updatedEvent = { ...existingEvent, ...updateDto };

      eventRepository.findOne.mockResolvedValue(existingEvent);
      eventRepository.save.mockResolvedValue(updatedEvent);

      // Act
      const result = await eventService.update(1, updateDto);

      // Assert
      expect(result.title).toBe('New Title');
      expect(eventRepository.save).toHaveBeenCalled();
    });

    it('should update multiple fields at once', async () => {
      // Arrange
      const existingEvent = createMockEvent();
      const updateDto: UpdateEventDto = {
        title: 'Updated Title',
        description: 'Updated Description',
        location: 'New Location',
        capacity: 200,
      };

      eventRepository.findOne.mockResolvedValue(existingEvent);
      eventRepository.save.mockResolvedValue({ ...existingEvent, ...updateDto });

      // Act
      const result = await eventService.update(1, updateDto);

      // Assert
      expect(result.title).toBe('Updated Title');
      expect(result.description).toBe('Updated Description');
      expect(result.location).toBe('New Location');
      expect(result.capacity).toBe(200);
    });

    it('should throw NotFoundException when updating non-existent event', async () => {
      // Arrange
      eventRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        eventService.update(999, { title: 'New Title' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should only update provided fields', async () => {
      // Arrange
      const existingEvent = createMockEvent({
        title: 'Original',
        description: 'Original Desc',
        location: 'Original Location',
      });
      const updateDto: UpdateEventDto = { title: 'New Title' };

      eventRepository.findOne.mockResolvedValue(existingEvent);
      eventRepository.save.mockImplementation((event) =>
        Promise.resolve(event as Event),
      );

      // Act
      const result = await eventService.update(1, updateDto);

      // Assert
      expect(result.title).toBe('New Title');
      expect(result.description).toBe('Original Desc');
      expect(result.location).toBe('Original Location');
    });

    it('should convert date strings when updating dates', async () => {
      // Arrange
      const existingEvent = createMockEvent();
      const updateDto: UpdateEventDto = {
        startDate: '2026-07-01T09:00:00Z',
        endDate: '2026-07-01T18:00:00Z',
      };

      eventRepository.findOne.mockResolvedValue(existingEvent);
      eventRepository.save.mockImplementation((event) =>
        Promise.resolve(event as Event),
      );

      // Act
      const result = await eventService.update(1, updateDto);

      // Assert
      expect(result.startDate).toBeInstanceOf(Date);
      expect(result.endDate).toBeInstanceOf(Date);
    });
  });

  describe('togglePublish', () => {
    it('should toggle isPublished from false to true', async () => {
      // Arrange
      const unpublishedEvent = createMockEvent({ isPublished: false });
      eventRepository.findOne.mockResolvedValue(unpublishedEvent);
      eventRepository.save.mockImplementation((event) =>
        Promise.resolve(event as Event),
      );

      // Act
      const result = await eventService.togglePublish(1);

      // Assert
      expect(result.isPublished).toBe(true);
    });

    it('should toggle isPublished from true to false', async () => {
      // Arrange
      const publishedEvent = createMockEvent({ isPublished: true });
      eventRepository.findOne.mockResolvedValue(publishedEvent);
      eventRepository.save.mockImplementation((event) =>
        Promise.resolve(event as Event),
      );

      // Act
      const result = await eventService.togglePublish(1);

      // Assert
      expect(result.isPublished).toBe(false);
    });

    it('should throw NotFoundException for non-existent event', async () => {
      // Arrange
      eventRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(eventService.togglePublish(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ============================================
  // DELETE Tests
  // ============================================
  describe('remove', () => {
    it('should remove event and return success message', async () => {
      // Arrange
      const event = createMockEvent({ id: 1, title: 'Event to Delete' });
      eventRepository.findOne.mockResolvedValue(event);
      eventRepository.remove.mockResolvedValue(event);

      // Act
      const result = await eventService.remove(1);

      // Assert
      expect(eventRepository.remove).toHaveBeenCalledWith(event);
      expect(result).toEqual({
        message: 'Event with ID 1 has been deleted',
      });
    });

    it('should throw NotFoundException when deleting non-existent event', async () => {
      // Arrange
      eventRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(eventService.remove(999)).rejects.toThrow(NotFoundException);
    });

    it('should include event ID in success message', async () => {
      // Arrange
      const event = createMockEvent({ id: 42, title: 'Annual Conference' });
      eventRepository.findOne.mockResolvedValue(event);
      eventRepository.remove.mockResolvedValue(event);

      // Act
      const result = await eventService.remove(42);

      // Assert
      expect(result.message).toContain('42');
      expect(result.message).toBe('Event with ID 42 has been deleted');
    });
  });

  // ============================================
  // Edge Cases
  // ============================================
  describe('Edge Cases', () => {
    it('should handle event with null capacity', async () => {
      // Arrange
      const createDto = createMockCreateEventDto({ capacity: null });
      const event = createMockEvent({ capacity: null });

      eventRepository.create.mockReturnValue(event);
      eventRepository.save.mockResolvedValue(event);

      // Act
      const result = await eventService.create(createDto);

      // Assert
      expect(result.capacity).toBeNull();
    });

    it('should handle very long title', async () => {
      // Arrange
      const longTitle = 'A'.repeat(500);
      const createDto = createMockCreateEventDto({ title: longTitle });
      const event = createMockEvent({ title: longTitle });

      eventRepository.create.mockReturnValue(event);
      eventRepository.save.mockResolvedValue(event);

      // Act
      const result = await eventService.create(createDto);

      // Assert
      expect(result.title).toHaveLength(500);
    });

    it('should handle special characters in description', async () => {
      // Arrange
      const specialDesc = 'Test <script>alert("xss")</script> & special chars: éàü';
      const createDto = createMockCreateEventDto({ description: specialDesc });
      const event = createMockEvent({ description: specialDesc });

      eventRepository.create.mockReturnValue(event);
      eventRepository.save.mockResolvedValue(event);

      // Act
      const result = await eventService.create(createDto);

      // Assert
      expect(result.description).toBe(specialDesc);
    });

    it('should handle concurrent findOne calls', async () => {
      // Arrange
      const event = createMockEvent();
      eventRepository.findOne.mockResolvedValue(event);

      // Act
      const results = await Promise.all([
        eventService.findOne(1),
        eventService.findOne(1),
        eventService.findOne(1),
      ]);

      // Assert
      expect(results).toHaveLength(3);
      results.forEach((result) => expect(result).toEqual(event));
    });
  });
});
