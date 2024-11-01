/* eslint-disable @typescript-eslint/no-explicit-any */
import { userBelongsToACompany } from "../middlewares/company.middlewares";
import { Middlewares } from "tsoa";
import {
  Body,
  Delete,
  Get,
  Path,
  Post,
  Put,
  Route,
  Tags,
  Security,
  Request,
} from "tsoa";
import { EventService } from "../services/eventService";
import { BookingService } from "../services/bookingService";
import {
  IResponse,
  TEvent,
  CreateEventDto,
  IUser,
  TBookings,
  CreateBookingDto,
} from "../utils/interfaces/common";
import { Request as Req } from "express";
import { checkRole } from "../middlewares";
import { roles } from "../utils/roles";
import AppError from "../utils/error";
import { Request as ExpressRequest } from "express";

@Tags("Events post")
@Route("/api/event")
export class EventController {
  @Get("/my")
  @Security("jwt")
  @Middlewares(
    checkRole(roles.COMPANY_ADMIN, roles.COMPANY_USER),
    userBelongsToACompany,
  )
  public async getEventPosts(
    @Request() request: Req,
  ): Promise<IResponse<TEvent[]>> {
    if (!request.user) {
      throw new AppError("User not authenticated", 401);
    }
    return EventService.getAllMyEvents(request.user as IUser);
  }

  @Get("/event/company/{year}")
  @Security("jwt")
  @Middlewares(checkRole(roles.COMPANY_ADMIN))
  public async getCompanyEventCountByMonth(
    @Request() request: ExpressRequest,
    @Path() year: number,
  ) {
    const companyId = request.user?.company?.companyId;
    if (!companyId) {
      throw new AppError("Company ID is missing", 400);
    }
    return EventService.companyeventsByMonth(Number(companyId), year);
  }

  @Get("/finished/company/{year}")
  @Security("jwt")
  @Middlewares(checkRole(roles.COMPANY_ADMIN))
  public async getFinishedEventCountByMonth(
    @Request() request: ExpressRequest,
    @Path() year: number,
  ) {
    const companyId = request.user?.company?.companyId;
    if (!companyId) {
      throw new AppError("Company ID is missing", 400);
    }
    return EventService.eventsFinishedByMonth(Number(companyId), year);
  }

  @Get("/all/all/{year}")
  @Security("jwt")
  @Middlewares(checkRole(roles.ADMIN))
  public async getallEventCountByMonth(
    @Request() request: ExpressRequest,
    @Path() year: number,
  ) {
    return EventService.eventsByMonth(year);
  }

  @Get("/")
  public async getEvents(): Promise<IResponse<TEvent[]>> {
    return EventService.getAllEvents();
  }

  @Get("/{id}")
  public async getEvent(@Path() id: number): Promise<IResponse<TEvent | null>> {
    return EventService.getEvent(id);
  }

  @Post("/")
  @Security("jwt")
  @Middlewares(
    checkRole(roles.COMPANY_ADMIN, roles.COMPANY_USER),
    userBelongsToACompany,
  )
  public async createEvent(
    @Body() event: CreateEventDto,
    @Request() request: Req,
  ): Promise<IResponse<TEvent>> {
    console.log(request.user);
    return new EventService(request).createEvent(event);
  }

  @Put("/{id}")
  public async updateEvent(
    @Path() id: number,
    @Body() event: CreateEventDto,
  ): Promise<IResponse<TEvent | null>> {
    return EventService.updateEvent(id, event);
  }

  @Delete("/{id}")
  public async deleteEvents(@Path() id: number): Promise<IResponse<null>> {
    await EventService.deleteEvent(id);
    return {
      statusCode: 200,
      message: "Event post deleted successfully",
    };
  }

  @Put("/{eventId}/set-accepting-bookings")
  @Security("jwt", [roles.COMPANY_ADMIN])
  public async setAcceptingBooking(
    @Path() eventId: number,
    @Body() requestBody: { isAcceptingBooking: boolean },
    @Request() request: Req,
  ): Promise<IResponse<null>> {
    if (!request.user) {
      throw new AppError("User not authenticated", 401);
    }

    await EventService.setAcceptingBooking(
      eventId,
      requestBody.isAcceptingBooking,
    );
    return {
      statusCode: 200,
      message: "Event post accepting applications status updated successfully",
      data: null,
    };
  }

  @Get("/{eventId}/is-accepting-bookings")
  public async isAcceptingApplications(
    @Path() eventId: number,
  ): Promise<IResponse<{ isAcceptingBooking: boolean }>> {
    const isAcceptingBooking = await EventService.isAcceptingBooking(eventId);
    return {
      statusCode: 200,
      message: "Event post accepting applications status fetched successfully",
      data: { isAcceptingBooking },
    };
  }
}
/* eslint-disable @typescript-eslint/no-explicit-any */

@Tags("Bookings")
@Route("/api/bookings")
export class BookingController {
  @Get("/booking/company/{year}")
  @Security("jwt")
  @Middlewares(checkRole(roles.COMPANY_ADMIN))
  public async getBookingEventCountByMonth(
    @Request() request: ExpressRequest,
    @Path() year: number,
  ) {
    const companyId = request.user?.company?.companyId;
    if (!companyId) {
      throw new AppError("Company ID is missing", 400);
    }
    return BookingService.BookingByMonth(Number(companyId), year);
  }
  @Post("/")
  public async createBooking(
    @Body() bookingData: CreateBookingDto,
    @Request() request: Req,
  ): Promise<IResponse<TBookings>> {
    // Use the user ID from the request if available, otherwise set to 0
    const userId = request.user?.id ?? 0;

    // Ensure phone number is provided for non-registered users
    if (userId === 0 && !bookingData.phoneForBooking) {
      throw new AppError(
        "Phone number is required for users without an account",
        400,
      );
    }

    // Check if email is provided
    if (!bookingData.emailForBooking) {
      throw new AppError("Email is required for booking", 400);
    }

    const response = await BookingService.createBooking({
      ...bookingData,
      userId, // Pass userId to the service
    });

    return response;
  }

  @Get("/{id}")
  public async getBooking(
    @Path() id: number,
  ): Promise<IResponse<TBookings | null>> {
    const booking = await BookingService.getBookingById(id);
    return {
      statusCode: booking.statusCode,
      message: booking.message,
      data: booking.data,
    };
  }

  @Get("/")
  public async getAllBookings(): Promise<IResponse<TBookings[]>> {
    const bookings = await BookingService.getAllBookings();
    return {
      statusCode: bookings.statusCode,
      message: bookings.message,
      data: bookings.data,
    };
  }

  @Put("/{id}")
  public async updateBookingStatus(
    @Path() id: number,
    @Body() statusUpdate: { status: string },
  ): Promise<IResponse<TBookings | null>> {
    const response = await BookingService.updateBookingStatus(
      id,
      statusUpdate.status,
    );
    return {
      statusCode: response.statusCode,
      message: response.message,
      data: response.data,
    };
  }

  @Delete("/{id}")
  public async deleteBooking(@Path() id: number): Promise<IResponse<null>> {
    const response = await BookingService.deleteBooking(id);
    return {
      statusCode: response.statusCode,
      message: response.message,
      data: null,
    };
  }
}
