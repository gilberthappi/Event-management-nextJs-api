import type { $Enums } from "@prisma/client";
import { Role } from "@prisma/client";
import { TsoaResponse } from "tsoa";
export interface IResponse<T> {
  statusCode: number;
  message: string;
  error?: unknown;
  data?: T;
}

export type TCompany = {
  id: number;
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

export type TUser = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  roles?: { id: number; role: string; userId: number }[];
  company?: { id: number; role: string; userId: number; companyId: number };
};

export type RoleT = "ADMIN" | "COMPANY_ADMIN" | "COMPANY_USER" | "USER";

export interface IUser extends Omit<TUser, "id" | "createdAt" | "updatedAt"> {}
export interface ILoginResponse
  extends Omit<TUser, "password" | "createdAt" | "updatedAt" | "roles"> {
  token: string;
  roles: $Enums.Role[];
}
export interface ILoginUser extends Pick<IUser, "email" | "password"> {}
export interface ISignUpUser
  extends Pick<
    IUser,
    "email" | "password" | "firstName" | "lastName" | "roles"
  > {}

export type TErrorResponse = TsoaResponse<
  400 | 401 | 500,
  IResponse<{ message: string }>
>;
export interface CreateCompanyDto {
  company: {
    name: string;
    address?: string;
    email: string;
    phoneNumber?: string;
  };
  contactPerson: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    role?: string;
    userId?: number;
  };
}

export interface CreateCompanyStaffDto {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: Role;
  companyId?: number;
}

export type TEvent = {
  id: number;
  title: string;
  companyId: number;
  location: string;
  description: string;
  bookingDeadline: Date;
  availableSeats: number;
  createdAt: Date;
  updatedAt: Date;
};

export interface CreateEventDto {
  title: string;
  location: string;
  description: string;
  bookingDeadline: Date;
  availableSeats: number;
}

export type TBookings = {
  id: number;
  userId?: number | null;
  eventId: number;
  numberOfseats: number;
  emailForBooking: string;
  phoneForBooking: string;
  bookingStatus: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

export interface CreateBookingDto {
  eventId: number;
  userId?: number | null;
  numberOfseats: number;
  emailForBooking: string;
  phoneForBooking: string;
}

export interface IResponse<T> {
  statusCode: number;
  message: string;
  data?: T;
}
