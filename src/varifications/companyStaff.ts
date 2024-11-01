import { prisma } from "../utils/client";
import { IValidationError } from "./../utils/error";
import { CreateCompanyStaffDto } from "./../utils/interfaces/common";

export class companyStaffValidations {
  static async onCreate(
    data: CreateCompanyStaffDto,
  ): Promise<IValidationError[]> {
    const errors: IValidationError[] = [];
    const emailTaken = await prisma.user.findFirst({
      where: { email: data.email },
    });

    const phoneTaken = await prisma.companyUser.findFirst({
      where: { phoneNumber: data?.phoneNumber },
    });

    if (emailTaken) {
      errors.push({
        field: "email",
        error: "Email is already taken",
      });
    }
    if (phoneTaken) {
      errors.push({
        field: "phoneNumber",
        error: "Phone number is already taken",
      });
    }
    return errors;
  }
}
