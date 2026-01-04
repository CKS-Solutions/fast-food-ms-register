import { CustomerListDto } from '@dto/customer-list.dto';
import { Customer } from '@entities/customer';
import { Injectable, Inject } from '@nestjs/common';
import {
  ICustomerRepository,
  CUSTOMER_REPOSITORY_TOKEN,
} from '@ports/customer.repository';
import {
  ICustomerService,
  CUSTOMER_SERVICE_TOKEN,
} from '@services/customer.service';

export const LIST_CUSTOMER_USE_CASE_TOKEN = Symbol('IListCustomerUseCase');

export interface IListCustomerUseCase {
  execute: (filters: CustomerListDto) => Promise<Customer[]>;
}

@Injectable()
export class ListCustomerUseCase implements IListCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY_TOKEN)
    private readonly customerRepository: ICustomerRepository,
    @Inject(CUSTOMER_SERVICE_TOKEN)
    private readonly customerService: ICustomerService,
  ) {}

  async execute(filters: CustomerListDto): Promise<Customer[]> {
    const filtersModel = this.customerService.convertFiltersToModel(filters);
    return await this.customerRepository.list(filtersModel);
  }
}
