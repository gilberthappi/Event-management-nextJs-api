import {
  Body,
  Post,
  Route,
  Controller,
  Tags,
  Middlewares,
  Security,
  Get,
  Put,
} from "tsoa";
import { companyService } from "../services/companyService";
import { CreateCompanyDto } from "../utils/interfaces/common";
import { checkRole } from "../middlewares/checkRole";
import { roles } from "../utils/roles";
import { checkCompany } from "../middlewares/company.middlewares";
@Tags("Company")
@Security("jwt")
@Route("/api/company")
export class CompanyController extends Controller {
  @Get("/")
  @Middlewares(checkRole(roles.ADMIN))
  public getCompanies() {
    return companyService.getCompanies();
  }

  @Get("/school/count-by-month/{year}")
  public getSchoolsCountByMonth(year: number) {
    return companyService.getCompaniesCountByMonth(year);
  }

  @Get("/{id}")
  @Middlewares(checkCompany)
  public getSchool(id: number) {
    return companyService.getCompany(id);
  }

  @Post("/")
  @Middlewares(checkRole(roles.ADMIN))
  public async addCompany(@Body() company: CreateCompanyDto) {
    return await companyService.createCompany(company);
  }

  @Put("/{id}")
  @Middlewares(checkRole(roles.ADMIN))
  public updateCompany(id: number, @Body() company: CreateCompanyDto) {
    return companyService.updateCompany(id, company);
  }

  // @Delete("/{id}")
  // @Middlewares(checkRole(roles.ADMIN), checkCompany)
  // public deleteCompany(id: number) {
  //   return companyService.deleteCompany(id);
  // }
}
