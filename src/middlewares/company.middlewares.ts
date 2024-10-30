import type { NextFunction } from "express";
import type { Request, Response } from "express";
import { prisma } from "../utils/client";
import AppError from "../utils/error";

export const checkCompany = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number.parseInt(req.params.id);
    const company = await prisma.company.findUnique({
      where: { id: id },
    });

    if (!company) {
      return res.status(404).json({
        message: "No Company found ",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while checking the company",
    });
  }
};

export const userBelongsToACompany = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.company) {
      throw new AppError("You are not assigned to any company", 403);
    }
    next();
  } catch (error) {
    next(error);
  }
};
