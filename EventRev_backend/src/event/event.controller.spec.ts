import { Test, TestingModule } from '@nestjs/testing';
import { EventController } from './event.controller';
import { EventService } from './event.service';

describe('EventController', () => {
  let controller: EventController;
  let eventService: jest.Mocked<EventService>;

  // Mock EventService - ne pas utiliser le vrai service!
  const mockEventService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findPublished: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    togglePublish: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventController],
      providers: [
        {
          provide: EventService,
          useValue: mockEventService,
        },
      ],
    }).compile();

    controller = module.get<EventController>(EventController);
    eventService = module.get(EventService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of events', async () => {
      // Arrange
      const mockEvents = [{ id: 1, title: 'Event 1' }, { id: 2, title: 'Event 2' }];
      mockEventService.findAll.mockResolvedValue(mockEvents);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toEqual(mockEvents);
      expect(mockEventService.findAll).toHaveBeenCalled();
    });
  });

  describe('findPublished', () => {
    it('should return only published events', async () => {
      // Arrange
      const publishedEvents = [{ id: 1, title: 'Published Event', isPublished: true }];
      mockEventService.findPublished.mockResolvedValue(publishedEvents);

      // Act
      const result = await controller.findPublished();

      // Assert
      expect(result).toEqual(publishedEvents);
      expect(mockEventService.findPublished).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single event by id', async () => {
      // Arrange
      const mockEvent = { id: 1, title: 'Test Event' };
      mockEventService.findOne.mockResolvedValue(mockEvent);

      // Act
      const result = await controller.findOne(1);

      // Assert
      expect(result).toEqual(mockEvent);
      expect(mockEventService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create a new event', async () => {
      // Arrange
      const createDto = { title: 'New Event', startDate: '2026-03-15T09:00:00Z' };
      const createdEvent = { id: 1, ...createDto };
      mockEventService.create.mockResolvedValue(createdEvent);

      // Act
      const result = await controller.create(createDto as any);

      // Assert
      expect(result).toEqual(createdEvent);
      expect(mockEventService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update an event', async () => {
      // Arrange
      const updateDto = { title: 'Updated Title' };
      const updatedEvent = { id: 1, title: 'Updated Title' };
      mockEventService.update.mockResolvedValue(updatedEvent);

      // Act
      const result = await controller.update(1, updateDto as any);

      // Assert
      expect(result).toEqual(updatedEvent);
      expect(mockEventService.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('remove', () => {
    it('should delete an event', async () => {
      // Arrange
      const deleteResult = { message: 'Event with ID 1 has been deleted' };
      mockEventService.remove.mockResolvedValue(deleteResult);

      // Act
      const result = await controller.remove(1);

      // Assert
      expect(result).toEqual(deleteResult);
      expect(mockEventService.remove).toHaveBeenCalledWith(1);
    });
  });
});
