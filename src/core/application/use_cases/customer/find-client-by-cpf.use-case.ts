import { Customer } from '@entities/customer';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CustomerRepository } from '@repositories/customer.repository.impl';
import { ERROR_CODES } from '@shared/constants';

@Injectable()
export class FindClientByCpfUseCase {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async execute(cpf: string): Promise<Customer> {
    const result = await this.customerRepository.get(cpf);
    if (!result)
      throw new HttpException(
        ERROR_CODES.CUSTOMER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );

    return result;
  }
}
