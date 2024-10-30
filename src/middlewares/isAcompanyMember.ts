import type { Request, Response, NextFunction } from "express";
import { prisma } from "../utils/client";
import { roles } from "../utils/roles";

export const isACompanyMemberOrAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    //@ts-ignore
    const userRoles = req.user.roles;
    if (
      userRoles?.some(
        (role) =>
          role.role.includes(roles.ADMIN) ||
          role.role.includes(roles.COMPANY_ADMIN),
      )
    ) {
      return next();
    }
    const user = await prisma.companyUser.findFirst({
      where: {
        userId,
      },
    });

    if (!user || !user.companyId) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while checking if user is a company member",
    });
  }
};
