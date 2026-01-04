import { CustomerDto } from '@dto/customer.dto';
import { Customer } from '@entities/customer';
import { HttpException, HttpStatus, Injectable, Inject } from '@nestjs/common';
import {
  ICustomerRepository,
  CUSTOMER_REPOSITORY_TOKEN,
} from '@ports/customer.repository';
import {
  ICustomerService,
  CUSTOMER_SERVICE_TOKEN,
} from '@services/customer.service';
import { ERROR_CODES } from '@shared/constants';

export const CREATE_CUSTOMER_USE_CASE_TOKEN = Symbol('ICreateCustomerUseCase');

export interface ICreateCustomerUseCase {
  execute: (customer: CustomerDto) => Promise<Customer>;
}

@Injectable()
export class CreateCustomerUseCase implements ICreateCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY_TOKEN)
    private readonly customerRepository: ICustomerRepository,
    @Inject(CUSTOMER_SERVICE_TOKEN)
    private readonly customerService: ICustomerService,
  ) {}

  async execute(customer: CustomerDto): Promise<Customer> {
    const customerExists = await this.customerRepository.list({
      cpf: customer.cpf,
    });

    if (customerExists.length > 0) {
      throw new HttpException(
        ERROR_CODES.CUSTOMER_ALREADY_EXISTS,
        HttpStatus.BAD_REQUEST,
      );
    }

    const customerModel = this.customerService.create(customer);
    return await this.customerRepository.create(customerModel);
  }
}
