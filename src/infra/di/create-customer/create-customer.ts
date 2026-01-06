import { RDSClientWrapper } from "@aws/rds_client";
import { CustomerRepository } from "@driven_rds/customer";
import { RDSCredentials } from "@utils/rds";
import { CustomerService } from "@services/customer.service";
import { CreateCustomerUseCase } from "@usecases/create-customer/create-customer.use-case";

export class CreateCustomerContainerFactory {
  usecase: CreateCustomerUseCase;

  constructor(credentials: RDSCredentials) {
    const rdsClient = RDSClientWrapper.getInstance({
      host: credentials.host,
      user: credentials.user,
      password: credentials.password,
      pool: credentials.pool,
      useSsl: credentials.useSsl,
    });

    const customerRepo = new CustomerRepository(rdsClient);
    const customerService = new CustomerService();

    this.usecase = new CreateCustomerUseCase(customerRepo, customerService);
  }
}

