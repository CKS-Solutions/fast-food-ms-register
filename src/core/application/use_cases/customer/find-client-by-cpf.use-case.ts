import { Customer } from '@entities/customer';
import { HttpException, HttpStatus, Injectable, Inject } from '@nestjs/common';
import {
  ICustomerRepository,
  CUSTOMER_REPOSITORY_TOKEN,
} from '@ports/customer.repository';
import { ERROR_CODES } from '@shared/constants';

export const FIND_CLIENT_BY_CPF_USE_CASE_TOKEN = Symbol(
  'IFindClientByCpfUseCase',
);

export interface IFindClientByCpfUseCase {
  execute: (cpf: string) => Promise<Customer>;
}

@Injectable()
export class FindClientByCpfUseCase implements IFindClientByCpfUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY_TOKEN)
    private readonly customerRepository: ICustomerRepository,
  ) {}

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
