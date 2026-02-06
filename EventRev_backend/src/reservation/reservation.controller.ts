import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

interface AuthenticatedRequest extends Request {
  user: {
    userId: number;
    email: string;
    role: Role;
  };
}

@ApiTags('Reservations')
@ApiBearerAuth()
@Controller('reservations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post()
  @Roles(Role.User)
  @ApiOperation({
    summary: 'Create a new reservation',
    description:
      'Allows a user to reserve tickets for an event. The reservation starts with "pending" status and must be confirmed by an admin. Users can only create one reservation per event.',
  })
  @ApiBody({
    type: CreateReservationDto,
    examples: {
      basic: {
        summary: 'Basic reservation',
        description: 'Reserve 1 ticket for an event',
        value: {
          eventId: 1,
          numberOfTickets: 1,
        },
      },
      withNotes: {
        summary: 'Reservation with notes',
        description: 'Reserve multiple tickets with special requests',
        value: {
          eventId: 1,
          numberOfTickets: 3,
          notes: 'We need seats together, one person uses a wheelchair',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description:
      'Reservation created successfully (pending admin confirmation)',
    schema: {
      example: {
        id: 1,
        userId: 5,
        eventId: 1,
        status: 'pending',
        numberOfTickets: 2,
        notes: 'Need wheelchair accessibility',
        createdAt: '2026-02-03T10:30:00.000Z',
        updatedAt: '2026-02-03T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Event is in the past or not enough capacity',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token missing or invalid',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - User role required' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - User already has a reservation for this event',
  })
  create(
    @Request() req: AuthenticatedRequest,
    @Body() createReservationDto: CreateReservationDto,
  ) {
    return this.reservationService.create(
      req.user.userId,
      createReservationDto,
    );
  }

  @Get('my-reservations')
  @Roles(Role.User)
  @ApiOperation({
    summary: 'Get all my reservations',
    description:
      'Retrieves all reservations made by the currently authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'List of user reservations',
    schema: {
      example: [
        {
          id: 1,
          userId: 5,
          eventId: 1,
          status: 'confirmed',
          numberOfTickets: 2,
          notes: null,
          createdAt: '2026-02-03T10:30:00.000Z',
          updatedAt: '2026-02-03T10:30:00.000Z',
          event: {
            id: 1,
            title: 'Tech Conference 2026',
            startDate: '2026-03-15T09:00:00.000Z',
            location: 'Paris Convention Center',
            category: {
              id: 1,
              name: 'Technology',
            },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findMyReservations(@Request() req: AuthenticatedRequest) {
    return this.reservationService.findAllByUser(req.user.userId);
  }

  @Get('event/:eventId')
  @Roles(Role.Admin)
  @ApiOperation({
    summary: 'Get all reservations for an event (Admin only)',
    description:
      'Retrieves all reservations for a specific event. Only accessible by admins.',
  })
  @ApiParam({
    name: 'eventId',
    description: 'ID of the event',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'List of reservations for the event',
    schema: {
      example: [
        {
          id: 1,
          userId: 5,
          eventId: 1,
          status: 'confirmed',
          numberOfTickets: 2,
          notes: 'VIP guest',
          createdAt: '2026-02-03T10:30:00.000Z',
          user: {
            id: 5,
            email: 'user@example.com',
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  findByEvent(@Param('eventId', ParseIntPipe) eventId: number) {
    return this.reservationService.findAllByEvent(eventId);
  }

  @Get('pending')
  @Roles(Role.Admin)
  @ApiOperation({
    summary: 'Get all pending reservations (Admin only)',
    description:
      'Retrieves all reservations awaiting confirmation. Only accessible by admins.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of pending reservations',
    schema: {
      example: [
        {
          id: 1,
          userId: 5,
          eventId: 1,
          status: 'pending',
          numberOfTickets: 2,
          notes: 'First time attendee',
          createdAt: '2026-02-03T10:30:00.000Z',
          user: {
            id: 5,
            email: 'user@example.com',
          },
          event: {
            id: 1,
            title: 'Tech Conference 2026',
            startDate: '2026-03-15T09:00:00.000Z',
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  findAllPending() {
    return this.reservationService.findAllPending();
  }

  @Patch(':id/confirm')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirm a reservation (Admin only)',
    description:
      'Confirms a pending reservation. Only accessible by admins. Validates capacity before confirming.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the reservation to confirm',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Reservation confirmed successfully',
    schema: {
      example: {
        id: 1,
        userId: 5,
        eventId: 1,
        status: 'confirmed',
        numberOfTickets: 2,
        notes: null,
        createdAt: '2026-02-03T10:30:00.000Z',
        updatedAt: '2026-02-03T14:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad request - Already confirmed, cancelled, or not enough capacity',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  confirm(@Param('id', ParseIntPipe) id: number) {
    return this.reservationService.confirmReservation(id);
  }

  @Patch(':id/reject')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reject a reservation (Admin only)',
    description: 'Rejects a pending reservation. Only accessible by admins.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the reservation to reject',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Reservation rejected successfully',
    schema: {
      example: {
        id: 1,
        userId: 5,
        eventId: 1,
        status: 'cancelled',
        numberOfTickets: 2,
        notes: null,
        createdAt: '2026-02-03T10:30:00.000Z',
        updatedAt: '2026-02-03T14:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - Already cancelled' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  reject(@Param('id', ParseIntPipe) id: number) {
    return this.reservationService.rejectReservation(id);
  }

  @Get('availability/:eventId')
  @ApiOperation({
    summary: 'Check event availability',
    description:
      'Returns the capacity, reserved tickets, and available spots for an event',
  })
  @ApiParam({
    name: 'eventId',
    description: 'ID of the event to check availability',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Event availability information',
    schema: {
      example: {
        capacity: 100,
        reserved: 45,
        available: 55,
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  getAvailability(@Param('eventId', ParseIntPipe) eventId: number) {
    return this.reservationService.getEventAvailability(eventId);
  }

  @Get(':id')
  @Roles(Role.User)
  @ApiOperation({
    summary: 'Get a specific reservation',
    description:
      'Retrieves details of a specific reservation. Users can only view their own reservations.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the reservation',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Reservation details',
    schema: {
      example: {
        id: 1,
        userId: 5,
        eventId: 1,
        status: 'confirmed',
        numberOfTickets: 2,
        notes: 'Front row seats preferred',
        createdAt: '2026-02-03T10:30:00.000Z',
        updatedAt: '2026-02-03T10:30:00.000Z',
        event: {
          id: 1,
          title: 'Tech Conference 2026',
          startDate: '2026-03-15T09:00:00.000Z',
          location: 'Paris Convention Center',
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only view own reservations',
  })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.reservationService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @Roles(Role.User)
  @ApiOperation({
    summary: 'Update a reservation',
    description:
      'Updates an existing reservation. Users can only update their own reservations.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the reservation to update',
    example: 1,
  })
  @ApiBody({
    type: UpdateReservationDto,
    examples: {
      updateTickets: {
        summary: 'Update number of tickets',
        value: {
          numberOfTickets: 4,
        },
      },
      updateNotes: {
        summary: 'Update notes',
        value: {
          notes: 'Changed to require vegetarian meals',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Reservation updated successfully',
    schema: {
      example: {
        id: 1,
        userId: 5,
        eventId: 1,
        status: 'confirmed',
        numberOfTickets: 4,
        notes: 'Changed to require vegetarian meals',
        createdAt: '2026-02-03T10:30:00.000Z',
        updatedAt: '2026-02-03T11:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad request - Cannot update cancelled reservation or not enough capacity',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only update own reservations',
  })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
    @Body() updateReservationDto: UpdateReservationDto,
  ) {
    return this.reservationService.update(
      id,
      req.user.userId,
      updateReservationDto,
    );
  }

  @Patch(':id/cancel')
  @Roles(Role.User)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel a reservation',
    description:
      'Cancels an existing reservation. Users can only cancel their own reservations.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the reservation to cancel',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Reservation cancelled successfully',
    schema: {
      example: {
        id: 1,
        userId: 5,
        eventId: 1,
        status: 'cancelled',
        numberOfTickets: 2,
        notes: null,
        createdAt: '2026-02-03T10:30:00.000Z',
        updatedAt: '2026-02-03T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Reservation already cancelled',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only cancel own reservations',
  })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.reservationService.cancel(id, req.user.userId);
  }

  @Delete(':id')
  @Roles(Role.User)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a reservation',
    description:
      'Permanently deletes a reservation. Users can only delete their own reservations.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the reservation to delete',
    example: 1,
  })
  @ApiResponse({ status: 204, description: 'Reservation deleted successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only delete own reservations',
  })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.reservationService.remove(id, req.user.userId);
  }
}
