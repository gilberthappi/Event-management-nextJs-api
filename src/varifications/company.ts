import { prisma } from "../utils/client";
import { IValidationError } from "./../utils/error";
import { CreateCompanyDto } from "./../utils/interfaces/common";

export class companyValidations {
  static async onCreate(data: CreateCompanyDto): Promise<IValidationError[]> {
    const errors: IValidationError[] = [];
    const emailTaken = await prisma.company.findFirst({
      where: { email: data.company.email },
    });

    const phoneTaken = await prisma.company.findFirst({
      where: { phoneNumber: data.company.phoneNumber },
    });

    if (emailTaken) {
      errors.push({
        field: "company.email",
        error: "Email used by other company",
      });
    }
    if (phoneTaken) {
      errors.push({
        field: "company.phoneNumber",
        error: "Phone number used by other company",
      });
    }
    return errors;
  }
}
