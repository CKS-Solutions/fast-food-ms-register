import { FindClientByCpfUseCase } from "@usecases/find-client-by-cpf/find-client-by-cpf.use-case";
import { RDSClientWrapper } from "@aws/rds_client";
import { CustomerRepository } from "@driven_rds/customer";
import { RDSCredentials } from "@utils/rds";

export class FindClientByCpfContainerFactory {
  usecase: FindClientByCpfUseCase;

  constructor(credentials: RDSCredentials) {
    const rdsClient = RDSClientWrapper.getInstance({
      host: credentials.host,
      user: credentials.user,
      password: credentials.password,
      pool: credentials.pool,
      useSsl: credentials.useSsl,
    });

    const customerRepo = new CustomerRepository(rdsClient);

    this.usecase = new FindClientByCpfUseCase(customerRepo);
  }
}

