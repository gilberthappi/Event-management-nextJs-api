/* eslint-disable @typescript-eslint/no-explicit-any */
import { companyValidations } from "./../varifications/company";
import { Emitter } from "../events";
import { EventType } from "../events/types";
import { prisma } from "../utils/client";
import AppError, { ValidationError } from "../utils/error";
import {
  CreateCompanyDto,
  IResponse,
  TCompany,
} from "../utils/interfaces/common";
import { roles } from "../utils/roles";

export class companyService {
  public static async getCompanies(): Promise<IResponse<TCompany[]>> {
    const companies = await prisma.company.findMany();
    return {
      message: "Companies fetched successfully",
      statusCode: 200,
      data: companies,
    };
  }

  public static async getCompany(id: number) {
    const company = await prisma.company.findUnique({
      where: { id: id },
      include: {
        CompanyUser: {
          where: {
            user: {
              roles: {
                some: {
                  role: roles.COMPANY_ADMIN,
                },
              },
            },
          },
          take: 1,
          include: {
            user: true,
          },
        },
      },
    });
    const response = {
      company: {
        id: company!.id,
        name: company!.name,
        address: company!.address,
        phoneNumber: company!.phoneNumber,
        email: company!.email,
      },
      contactPerson: {
        id: company!.CompanyUser[0].user.id,
        firstName: company!.CompanyUser[0].user.firstName,
        lastName: company!.CompanyUser[0].user.lastName,
        email: company!.CompanyUser[0].user.email,
        phoneNumber: company!.CompanyUser[0].phoneNumber,
        role: company!.CompanyUser[0].role,
      },
    };
    return {
      message: "company fetched successfully",
      statusCode: 200,
      data: response,
    };
  }
  // Get companies count by month, filtered by year
  public static async getCompaniesCountByMonth(
    year: number,
  ): Promise<IResponse<any>> {
    try {
      const companies = await prisma.company.findMany({
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

      // Initialize an array with 12 months (0 for each month)
      const companiesByMonth = Array(12).fill(0);

      // Group by month using JavaScript
      companies.forEach((company) => {
        const month = new Date(company.createdAt).getMonth(); // getMonth returns 0-based month
        companiesByMonth[month]++;
      });

      return {
        message: "Companies count by month fetched successfully",
        statusCode: 200,
        data: companiesByMonth,
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }

  static async createCompany(data: CreateCompanyDto) {
    const errors = await companyValidations.onCreate(data);
    if (errors[0]) {
      throw new ValidationError(errors);
    }
    const newCompany = await prisma.company.create({
      data: {
        ...data.company,
        address: data.company.address ?? "",
        phoneNumber: data.company.phoneNumber ?? "",
        email: data.company.email ?? "",
      },
    });
    Emitter.emit(EventType.COMPANY_CREATED, newCompany, data);
    return {
      message: "Company Created Successfully!!",
      statusCode: 201,
      data: newCompany,
    };
  }

  public static async updateCompany(id: number, data: CreateCompanyDto) {
    try {
      const updatedCompany = await prisma.company.update({
        where: { id },
        data: {
          ...(data?.company as TCompany),
        },
      });

      Emitter.emit(EventType.COMPANY_UPDATED, updatedCompany, data);

      return {
        message: "Company updated successfully",
        statusCode: 200,
        data: updatedCompany,
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }
}
