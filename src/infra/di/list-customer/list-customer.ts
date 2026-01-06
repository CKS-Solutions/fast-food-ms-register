import { ListCustomerUseCase } from "@usecases/list-customer/list-customer.use-case";
import { RDSClientWrapper } from "@aws/rds_client";
import { CustomerRepository } from "@driven_rds/customer";
import { RDSCredentials } from "@utils/rds";
import { CustomerService } from "@services/customer.service";

export class ListCustomerContainerFactory {
  usecase: ListCustomerUseCase;

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

    this.usecase = new ListCustomerUseCase(customerRepo, customerService);
  }
}

