import { Module } from '@nestjs/common';
import { CustomerController } from '@controllers/customer.controller';
import {
  CustomerService,
  CUSTOMER_SERVICE_TOKEN,
} from '@services/customer.service';
import { CustomerRepository } from './adapters/driven/repositories/customer.repository.impl';
import { CUSTOMER_REPOSITORY_TOKEN } from '@ports/customer.repository';
import {
  CreateCustomerUseCase,
  CREATE_CUSTOMER_USE_CASE_TOKEN,
} from '@usecases/customer/create-customer.use-case';
import {
  ListCustomerUseCase,
  LIST_CUSTOMER_USE_CASE_TOKEN,
} from '@usecases/customer/list-customer.use-case';
import {
  FindClientByCpfUseCase,
  FIND_CLIENT_BY_CPF_USE_CASE_TOKEN,
} from '@usecases/customer/find-client-by-cpf.use-case';

@Module({
  controllers: [CustomerController],
  providers: [
    {
      provide: CUSTOMER_SERVICE_TOKEN,
      useClass: CustomerService,
    },
    {
      provide: CUSTOMER_REPOSITORY_TOKEN,
      useClass: CustomerRepository,
    },
    {
      provide: CREATE_CUSTOMER_USE_CASE_TOKEN,
      useClass: CreateCustomerUseCase,
    },
    {
      provide: LIST_CUSTOMER_USE_CASE_TOKEN,
      useClass: ListCustomerUseCase,
    },
    {
      provide: FIND_CLIENT_BY_CPF_USE_CASE_TOKEN,
      useClass: FindClientByCpfUseCase,
    },
    CustomerService,
    CustomerRepository,
    CreateCustomerUseCase,
    ListCustomerUseCase,
    FindClientByCpfUseCase,
  ],
})
export class CustomerModule {}
