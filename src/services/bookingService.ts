// C:\Users\gdush\Documents\GitHub\ims-be\src\services\bookingService.ts

import { PrismaClient } from "@prisma/client";
import {
  CreateBookingDto,
  TBookings,
  IResponse,
} from "../utils/interfaces/common";
import AppError from "../utils/error";

const prisma = new PrismaClient();

export class BookingService {
  // Create a new booking
  static async createBooking(
    data: CreateBookingDto,
    userId: number = 0, // defaults to 0 for non-registered users
  ): Promise<IResponse<TBookings>> {
    try {
      // Check if booking already exists for the same event and email
      const existingBooking = await prisma.bookings.findFirst({
        where: {
          eventId: data.eventId,
          emailForBooking: data.emailForBooking,
        },
      });

      if (existingBooking) {
        return {
          statusCode: 400,
          message:
            "User has already booked this event with the provided email.",
        };
      }

      // Check if userId is valid for registered users
      if (userId !== 0) {
        const userExists = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (!userExists) {
          return {
            statusCode: 400,
            message: "User does not exist.",
          };
        }
      }

      // Prepare booking data
      const bookingData = {
        eventId: data.eventId,
        numberOfseats: data.numberOfseats,
        emailForBooking: data.emailForBooking,
        phoneForBooking: data.phoneForBooking,
        bookingStatus: "waiting",
        userId: userId !== 0 ? userId : null, // Use null for non-registered users
      };

      const booking = await prisma.bookings.create({
        data: bookingData,
      });

      return {
        statusCode: 201,
        message: "Booking created successfully",
        data: booking,
      };
    } catch (error) {
      console.error("Booking creation error:", error); // Log the error for debugging
      return {
        statusCode: 500,
        message: "Failed to create booking",
        // error: error.message || error,
      };
    }
  }

  // Get booking by ID
  static async getBookingById(
    id: number,
  ): Promise<IResponse<TBookings | null>> {
    try {
      const booking = await prisma.bookings.findUnique({
        where: { id },
      });
      if (booking) {
        return { statusCode: 200, message: "Booking found", data: booking };
      }
      return { statusCode: 404, message: "Booking not found" };
    } catch (error) {
      return { statusCode: 500, message: "Failed to fetch booking", error };
    }
  }

  // Get all bookings
  static async getAllBookings(): Promise<IResponse<TBookings[]>> {
    try {
      const bookings = await prisma.bookings.findMany();
      return {
        statusCode: 200,
        message: "Bookings fetched successfully",
        data: bookings,
      };
    } catch (error) {
      return { statusCode: 500, message: "Failed to fetch bookings", error };
    }
  }

  // Update booking status
  static async updateBookingStatus(
    id: number,
    status: string,
  ): Promise<IResponse<TBookings | null>> {
    try {
      const booking = await prisma.bookings.update({
        where: { id },
        data: { bookingStatus: status },
      });
      return {
        statusCode: 200,
        message: "Booking status updated successfully",
        data: booking,
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: "Failed to update booking status",
        error,
      };
    }
  }

  // Delete booking by ID
  static async deleteBooking(id: number): Promise<IResponse<null>> {
    try {
      await prisma.bookings.delete({ where: { id } });
      return { statusCode: 200, message: "Booking deleted successfully" };
    } catch (error) {
      return { statusCode: 500, message: "Failed to delete booking", error };
    }
  }
  public static async BookingByMonth(
    companyId: number,
    year: number,
  ): Promise<IResponse<number[]>> {
    try {
      // Fetch all Event posts created by the company for the given year
      const bookings = await prisma.bookings.findMany({
        where: {
          event: {
            companyId: companyId, // Filter by company ID (event post must be from this company)
          },
          createdAt: {
            gte: new Date(`${year}-01-01`),
            lt: new Date(`${year + 1}-01-01`),
          },
        },
        select: {
          createdAt: true, // Select the creation date to group by month
        },
      });

      // Initialize an array with 12 elements (for 12 months) to hold the count for each month
      const bookingsByMonth = Array(12).fill(0);

      // Group event posts by the month they were created
      bookings.forEach((event) => {
        const month = new Date(event.createdAt).getMonth(); // Get the month (0-based)
        bookingsByMonth[month]++;
      });

      return {
        message: "event post count by month fetched successfully",
        statusCode: 200,
        data: bookingsByMonth,
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }
}
