import { CustomerDto } from '@dto/customer.dto';
import { Customer } from '@entities/customer';
import {
  ICustomerRepository,
} from '@ports/customer.repository';
import {
  ICustomerService,
} from '@services/customer.service';
import { ERROR_CODES } from '@shared/constants';

export interface ICreateCustomerUseCase {
  execute: (customer: CustomerDto) => Promise<Customer>;
}

export class CreateCustomerUseCase implements ICreateCustomerUseCase {
  constructor(
    private readonly customerRepository: ICustomerRepository,
    private readonly customerService: ICustomerService,
  ) {}

  async execute(customer: CustomerDto): Promise<Customer> {
    const customerExists = await this.customerRepository.list({
      cpf: customer.cpf,
    });

    if (customerExists.length > 0) {
      throw new Error(ERROR_CODES.CUSTOMER_ALREADY_EXISTS);
    }

    const customerModel = this.customerService.create(customer);
    return await this.customerRepository.create(customerModel);
  }
}
