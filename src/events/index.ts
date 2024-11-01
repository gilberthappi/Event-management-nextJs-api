import EventEmitter from "events";
import {
  CreateCompanyDto,
  CreateCompanyStaffDto,
  TCompany,
  TUser,
} from "../utils/interfaces/common";
import { EventType } from "./types";
import { companyCreatedHandler, companyUpdateHandler } from "./company";
import {
  companyStaffCreatedHandler,
  companyStaffUpdateHandler,
} from "./company.staff";

export const Emitter = new EventEmitter();

Emitter.on(
  EventType.COMPANY_CREATED,
  (company: TCompany, data: CreateCompanyDto) => {
    companyCreatedHandler(company, data);
  },
);

Emitter.on(
  EventType.COMPANY_UPDATED,
  (company: TCompany, data: CreateCompanyDto) => {
    companyUpdateHandler(company, data);
  },
);

Emitter.on(
  EventType.COMPANY_STAFF_CREATED,
  (user: TUser, data: CreateCompanyStaffDto) => {
    companyStaffCreatedHandler(user, data);
  },
);

Emitter.on(
  EventType.COMPANY_STAFF_UPDATED,
  (user: TUser, data: CreateCompanyStaffDto) => {
    companyStaffUpdateHandler(user, data);
  },
);
