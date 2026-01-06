import { Customer } from '@entities/customer';
import {
  ICustomerRepository,
} from '@ports/customer.repository';
import { ERROR_CODES } from '@shared/constants';

export interface IFindClientByCpfUseCase {
  execute: (cpf: string) => Promise<Customer>;
}

export class FindClientByCpfUseCase implements IFindClientByCpfUseCase {
  constructor(
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(cpf: string): Promise<Customer> {
    const result = await this.customerRepository.get(cpf);
    if (!result)
      throw new Error(ERROR_CODES.CUSTOMER_NOT_FOUND);

    return result;
  }
}
