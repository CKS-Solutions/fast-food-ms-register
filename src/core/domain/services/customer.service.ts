import { CustomerListDto } from '@dto/customer-list.dto';
import { CustomerDto } from '@dto/customer.dto';
import { Customer } from '@entities/customer';

export interface ICustomerService {
  create: (customer: CustomerDto) => Customer;
  convertFiltersToModel: (filters: CustomerListDto) => Partial<Customer>;
}

export class CustomerService implements ICustomerService {
  create(customer: CustomerDto) {
    return new Customer(
      customer.cpf,
      customer.name ?? '',
      customer.email ?? '',
      customer.phone ?? '',
    );
  }

  convertFiltersToModel(filters: CustomerListDto): Partial<Customer> {
    const customerFiltersModel: Partial<Customer> = {};
    if (filters.cpf) customerFiltersModel.cpf = filters.cpf;
    if (filters.name) customerFiltersModel.name = filters.name;
    if (filters.email) customerFiltersModel.email = filters.email;
    if (filters.phone) customerFiltersModel.phone = filters.phone;

    return customerFiltersModel;
  }
}
