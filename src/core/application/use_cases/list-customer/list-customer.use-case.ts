import { CustomerListDto } from '@dto/customer-list.dto';
import { Customer } from '@entities/customer';
import {
  ICustomerRepository,
} from '@ports/customer.repository';
import {
  ICustomerService,
} from '@services/customer.service';

export interface IListCustomerUseCase {
  execute: (filters: CustomerListDto) => Promise<Customer[]>;
}

export class ListCustomerUseCase implements IListCustomerUseCase {
  constructor(
    private readonly customerRepository: ICustomerRepository,
    private readonly customerService: ICustomerService,
  ) {}

  async execute(filters: CustomerListDto): Promise<Customer[]> {
    const filtersModel = this.customerService.convertFiltersToModel(filters);
    return await this.customerRepository.list(filtersModel);
  }
}
