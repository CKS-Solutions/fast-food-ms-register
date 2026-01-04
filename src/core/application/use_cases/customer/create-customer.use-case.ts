import { CustomerDto } from '@dto/customer.dto';
import { Customer } from '@entities/customer';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CustomerRepository } from '@repositories/customer.repository.impl';
import { CustomerService } from '@services/customer.service';
import { ERROR_CODES } from '@shared/constants';

@Injectable()
export class CreateCustomerUseCase {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly customerService: CustomerService,
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
