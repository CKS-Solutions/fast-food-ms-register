import { CustomerListDto } from '@dto/customer-list.dto';
import { Customer } from '@entities/customer';
import { Injectable } from '@nestjs/common';
import { CustomerRepository } from '@repositories/customer.repository.impl';
import { CustomerService } from '@services/customer.service';

@Injectable()
export class ListCustomerUseCase {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly customerService: CustomerService,
  ) {}

  async execute(filters: CustomerListDto): Promise<Customer[]> {
    const filtersModel = this.customerService.convertFiltersToModel(filters);
    return await this.customerRepository.list(filtersModel);
  }
}
