import { roles } from "../utils/roles";
import { prisma } from "../utils/client";
import { CreateCompanyStaffDto, TUser } from "../utils/interfaces/common";

export const companyStaffCreatedHandler = async (
  user: TUser,
  data: CreateCompanyStaffDto,
) => {
  try {
    await prisma.$transaction(async (tx) => {
      const assignRole = await tx.userRoles.create({
        data: { userId: user?.id, role: roles.COMPANY_USER },
      });

      if (!assignRole) {
        throw new Error("Failed to assign role to company user");
      }

      await tx.companyUser.create({
        data: {
          companyId: data.companyId!,
          userId: user?.id,
          phoneNumber: data.phoneNumber,
          role: data.role,
        },
      });
    });
  } catch (error) {
    prisma.$disconnect();
  }
};

export const companyStaffUpdateHandler = async (
  user: TUser,
  data: CreateCompanyStaffDto,
) => {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.companyUser.update({
        where: { companyId: data?.companyId, userId: user?.id },
        data: {
          companyId: data.companyId!,
          userId: user?.id,
          phoneNumber: data.phoneNumber,
          role: data.role,
        },
      });
    });
  } catch (error) {
    prisma.$disconnect();
  }
};
