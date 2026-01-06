import { FindClientByCpfContainerFactory } from './find-client-by-cpf'

jest.mock('@aws/rds_client', () => ({
  RDSClientWrapper: {
    getInstance: jest.fn().mockReturnValue({}),
  },
}))

jest.mock('@driven_rds/customer', () => ({
  CustomerRepository: jest.fn(),
}))

jest.mock('@usecases/find-client-by-cpf/find-client-by-cpf.use-case', () => ({
  FindClientByCpfUseCase: jest.fn(),
}))

import { RDSClientWrapper } from '@aws/rds_client'
import { CustomerRepository } from '@driven_rds/customer'
import { FindClientByCpfUseCase } from '@usecases/find-client-by-cpf/find-client-by-cpf.use-case'
import { RDSCredentials } from '@utils/rds'

describe('FindClientByCpfContainerFactory', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should correctly wire all dependencies and expose usecase', () => {
    const credentialsMock: RDSCredentials = {
      host: 'localhost',
      user: 'user',
      password: 'pass',
    }

    const factory = new FindClientByCpfContainerFactory(credentialsMock)

    expect(RDSClientWrapper.getInstance).toHaveBeenCalledWith(credentialsMock)

    const rdsMock = RDSClientWrapper as jest.MockedClass<typeof RDSClientWrapper>

    expect(rdsMock).toBeDefined()
    expect(rdsMock.getInstance).toHaveBeenCalledWith(credentialsMock)

    const rdsClient = (rdsMock.getInstance as jest.Mock).mock.results[0].value
    const customerRepoMock = CustomerRepository as jest.MockedClass<typeof CustomerRepository>

    expect(customerRepoMock).toHaveBeenCalledWith(rdsClient)

    const customerRepoInstance = (CustomerRepository as jest.Mock).mock.instances[0]

    expect(FindClientByCpfUseCase).toHaveBeenCalledWith(customerRepoInstance)

    expect(factory.usecase).toBe(
      (FindClientByCpfUseCase as jest.Mock).mock.instances[0]
    )
  })
})

