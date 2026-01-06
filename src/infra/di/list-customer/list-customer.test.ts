import { ListCustomerContainerFactory } from './list-customer'

jest.mock('@aws/rds_client', () => ({
  RDSClientWrapper: {
    getInstance: jest.fn().mockReturnValue({}),
  },
}))

jest.mock('@driven_rds/customer', () => ({
  CustomerRepository: jest.fn(),
}))

jest.mock('@services/customer.service', () => ({
  CustomerService: jest.fn(),
}))

jest.mock('@usecases/list-customer/list-customer.use-case', () => ({
  ListCustomerUseCase: jest.fn(),
}))

import { RDSClientWrapper } from '@aws/rds_client'
import { CustomerRepository } from '@driven_rds/customer'
import { CustomerService } from '@services/customer.service'
import { ListCustomerUseCase } from '@usecases/list-customer/list-customer.use-case'
import { RDSCredentials } from '@utils/rds'

describe('ListCustomerContainerFactory', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should correctly wire all dependencies and expose usecase', () => {
    const credentialsMock: RDSCredentials = {
      host: 'localhost',
      user: 'user',
      password: 'pass',
    }

    const factory = new ListCustomerContainerFactory(credentialsMock)

    expect(RDSClientWrapper.getInstance).toHaveBeenCalledWith(credentialsMock)

    const rdsMock = RDSClientWrapper as jest.MockedClass<typeof RDSClientWrapper>

    expect(rdsMock).toBeDefined()
    expect(rdsMock.getInstance).toHaveBeenCalledWith(credentialsMock)

    const rdsClient = (rdsMock.getInstance as jest.Mock).mock.results[0].value
    const customerRepoMock = CustomerRepository as jest.MockedClass<typeof CustomerRepository>
    const customerServiceMock = CustomerService as jest.MockedClass<typeof CustomerService>

    expect(customerRepoMock).toHaveBeenCalledWith(rdsClient)
    expect(customerServiceMock).toHaveBeenCalled()

    const customerRepoInstance = (CustomerRepository as jest.Mock).mock.instances[0]
    const customerServiceInstance = (CustomerService as jest.Mock).mock.instances[0]

    expect(ListCustomerUseCase).toHaveBeenCalledWith(
      customerRepoInstance,
      customerServiceInstance
    )

    expect(factory.usecase).toBe(
      (ListCustomerUseCase as jest.Mock).mock.instances[0]
    )
  })
})

