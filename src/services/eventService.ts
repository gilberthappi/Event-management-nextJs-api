import { BaseService } from "./Service";
import { prisma } from "../utils/client";
import {
  TEvent,
  IResponse,
  CreateEventDto,
  IUser,
} from "../utils/interfaces/common";
import AppError from "../utils/error";

export class EventService extends BaseService {
  public async createEvent(event: CreateEventDto): Promise<IResponse<TEvent>> {
    try {
      const newEvent = await prisma.event.create({
        data: {
          title: event.title,
          companyId: this.request.user!.company!.companyId!,
          location: event.location,
          description: event.description,
          bookingDeadline: event.bookingDeadline,
          availableSeats: event.availableSeats,
        },
      });
      return {
        statusCode: 201,
        message: "Event created successfully",
        data: newEvent,
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }

  public static async getEvent(eventId: number): Promise<IResponse<TEvent>> {
    try {
      const events = await prisma.event.findUnique({
        where: {
          id: eventId,
        },
        include: {
          bookings: true,
          company: true,
        },
      });

      if (!events) {
        throw new AppError("event post not found", 404);
      }
      // numberOfBookings: event.bookings.length,
      // remainingSeats: event.availableSeats - event.bookings.length,

      const eventWithCounts = {
        ...events,
        numberOfBookings: events.bookings.length,
        remainingSeats: events.availableSeats - events.bookings.length,
      };

      return {
        statusCode: 200,
        message: "event post fetched successfully",
        data: eventWithCounts,
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }

  public static async getAllEvents(): Promise<IResponse<TEvent[]>> {
    try {
      const events = await prisma.event.findMany({
        include: {
          bookings: true,
          company: true,
        },
      });

      const eventWithCounts = events.map((event) => ({
        ...event,
        numberOfBookings: event.bookings.length,
        remainingSeats: event.availableSeats - event.bookings.length,
      }));

      return {
        statusCode: 200,
        message: "Event posts fetched successfully",
        data: eventWithCounts,
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }

  public static async getAllMyEvents(
    user: IUser,
  ): Promise<IResponse<TEvent[]>> {
    try {
      const events = await prisma.event.findMany({
        where: {
          companyId: user!.company!.companyId!,
        },
        include: {
          bookings: true,
        },
      });

      const eventWithCounts = events.map((event) => ({
        ...event,
        numberOfBookings: event.bookings.length,
        remainingSeats: event.availableSeats - event.bookings.length,
      }));

      return {
        statusCode: 200,
        message: "Event posts fetched successfully",
        data: eventWithCounts,
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }

  public static async companyeventsByMonth(
    companyId: number,
    year: number,
  ): Promise<IResponse<number[]>> {
    try {
      // Fetch all Event posts created by the company for the given year
      const events = await prisma.event.findMany({
        where: {
          companyId: companyId,
          createdAt: {
            gte: new Date(`${year}-01-01`),
            lt: new Date(`${year + 1}-01-01`),
          },
        },
        select: {
          createdAt: true,
        },
      });

      // Initialize an array with 12 elements (for 12 months) to hold the count for each month
      const eventsByMonth = Array(12).fill(0);

      // Group event posts by the month they were created
      events.forEach((event) => {
        const month = new Date(event.createdAt).getMonth(); // Get the month (0-based)
        eventsByMonth[month]++;
      });

      return {
        message: "Company event post count by month fetched successfully",
        statusCode: 200,
        data: eventsByMonth,
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }

  public static async eventsByMonth(
    year: number,
  ): Promise<IResponse<number[]>> {
    try {
      // Fetch all Event posts created by the company for the given year
      const events = await prisma.event.findMany({
        where: {
          createdAt: {
            gte: new Date(`${year}-01-01`),
            lt: new Date(`${year + 1}-01-01`),
          },
        },
        select: {
          createdAt: true,
        },
      });

      // Initialize an array with 12 elements (for 12 months) to hold the count for each month
      const eventsByMonth = Array(12).fill(0);

      // Group event posts by the month they were created
      events.forEach((event) => {
        const month = new Date(event.createdAt).getMonth(); // Get the month (0-based)
        eventsByMonth[month]++;
      });

      return {
        message: "event post count by month fetched successfully",
        statusCode: 200,
        data: eventsByMonth,
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }

  public static async eventsFinishedByMonth(
    companyId: number,
    year: number,
  ): Promise<IResponse<number[]>> {
    try {
      // Fetch all Event posts created by the company for the given year
      const events = await prisma.event.findMany({
        where: {
          companyId: companyId,
          bookingDeadline: {
            gte: new Date(`${year}-01-01`),
            lt: new Date(`${year + 1}-01-01`),
          },
        },
        select: {
          bookingDeadline: true,
        },
      });

      //count event which have finished bookingDeadline
      const eventsFinishedByMonth = Array(12).fill(0);

      // Group event posts by the month they were finished bookingDeadline
      events.forEach((event) => {
        const month = new Date(event.bookingDeadline).getMonth(); // Get the month (0-based)
        if (new Date(event.bookingDeadline).getTime() < new Date().getTime()) {
          eventsFinishedByMonth[month]++;
        }
      });

      return {
        message: "event post count by month fetched successfully",
        statusCode: 200,
        data: eventsFinishedByMonth,
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }

  public static async updateEvent(
    eventId: number,
    eventData: Partial<CreateEventDto>,
  ): Promise<IResponse<TEvent>> {
    try {
      const updatedEvent = await prisma.event.update({
        where: { id: eventId },
        data: {
          ...eventData,
        },
      });
      return {
        statusCode: 200,
        message: "Event post updated successfully",
        data: updatedEvent,
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }

  public static async deleteEvent(eventId: number): Promise<IResponse<null>> {
    try {
      await prisma.event.delete({ where: { id: eventId } });
      return {
        statusCode: 200,
        message: "Event post deleted successfully",
        data: null,
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }
  public static async setAcceptingBooking(
    eventId: number,
    isAcceptingBooking: boolean,
  ): Promise<void> {
    try {
      await prisma.event.update({
        where: { id: eventId },
        data: { isAcceptingBooking },
      });
    } catch (error) {
      throw new AppError(error, 500);
    }
  }

  public static async isAcceptingBooking(eventId: number): Promise<boolean> {
    try {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { isAcceptingBooking: true },
      });

      if (!event) {
        throw new AppError("Event post not found", 404);
      }

      return event.isAcceptingBooking;
    } catch (error) {
      throw new AppError(error, 500);
    }
  }
}
