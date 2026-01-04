import { DatabaseCustomer } from './customer.types';

export class Customer {
  constructor(
    public cpf: string,
    public name: string,
    public email: string,
    public phone: string,
  ) {}

  static fromDatabase(databaseCustomer: DatabaseCustomer): Customer {
    return new Customer(
      databaseCustomer.cpf,
      databaseCustomer.name,
      databaseCustomer.email,
      databaseCustomer.phone,
    );
  }
}
