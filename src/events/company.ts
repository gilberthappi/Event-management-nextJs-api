import { prisma } from "../utils/client";
import { CreateCompanyDto, TCompany } from "../utils/interfaces/common";
import { hashSync } from "bcrypt";
import { roles } from "../utils/roles";

export const companyCreatedHandler = async (
  company: TCompany,
  data: CreateCompanyDto,
) => {
  try {
    await prisma.$transaction(async (tx) => {
      const companyAdmin = await tx.user.create({
        data: {
          firstName: data.contactPerson.firstName,
          lastName: data.contactPerson.lastName,
          email: data.contactPerson.email,
          password: hashSync("Pa$$word1", 10),
        },
      });
      if (!companyAdmin) {
        throw new Error("Failed to create company Admin");
      }
      const assignRole = await tx.userRoles.create({
        data: { userId: companyAdmin.id, role: roles.COMPANY_ADMIN },
      });
      if (!assignRole) {
        throw new Error("Failed to assign role to company Admin");
      }
      await tx.companyUser.create({
        data: {
          companyId: company.id!,
          userId: companyAdmin.id,
          phoneNumber: data.contactPerson.phoneNumber,
          role: data.contactPerson.role ?? "N/A",
        },
      });
      //TODO: Send email notification to company admin
    });
  } catch (error) {
    prisma.$disconnect();
  }
};

export const companyUpdateHandler = async (
  company: TCompany,
  data: CreateCompanyDto,
) => {
  try {
    await prisma.$transaction(async (tx) => {
      const companyAdmin = await tx.user.update({
        where: { id: data.contactPerson?.userId },
        data: {
          firstName: data.contactPerson.firstName,
          lastName: data.contactPerson.lastName,
          email: data.contactPerson.email,
        },
      });

      if (!companyAdmin) {
        throw new Error("Failed to update company Admin");
      }
      await tx.companyUser.update({
        where: { companyId: company.id, userId: companyAdmin.id },
        data: {
          companyId: company.id!,
          userId: companyAdmin.id,
          phoneNumber: data.contactPerson.phoneNumber,
          role: data.contactPerson.role ?? "N/A",
        },
      });
    });
  } catch (error) {
    prisma.$disconnect();
  }
};
