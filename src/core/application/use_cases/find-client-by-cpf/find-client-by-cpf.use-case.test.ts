import { FindClientByCpfUseCase } from './find-client-by-cpf.use-case'
import { ICustomerRepository } from '@ports/customer.repository'
import { Customer } from '@entities/customer'
import { ERROR_CODES } from '@shared/constants'

describe('FindClientByCpfUseCase', () => {
  let useCase: FindClientByCpfUseCase
  let mockCustomerRepository: jest.Mocked<ICustomerRepository>

  beforeEach(() => {
    mockCustomerRepository = {
      get: jest.fn(),
      list: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }

    useCase = new FindClientByCpfUseCase(mockCustomerRepository)
  })

  it('should return customer when found', async () => {
    const mockCustomer = new Customer('12345678900', 'John Doe', 'john@example.com', '11999999999')
    mockCustomerRepository.get.mockResolvedValue(mockCustomer)

    const result = await useCase.execute('12345678900')

    expect(mockCustomerRepository.get).toHaveBeenCalledWith('12345678900')
    expect(result).toEqual(mockCustomer)
  })

  it('should throw error when customer not found', async () => {
    mockCustomerRepository.get.mockResolvedValue(null)

    await expect(useCase.execute('99999999999')).rejects.toThrow(ERROR_CODES.CUSTOMER_NOT_FOUND)

    expect(mockCustomerRepository.get).toHaveBeenCalledWith('99999999999')
  })

  it('should throw error when repository throws error', async () => {
    const repositoryError = new Error('Database error')
    mockCustomerRepository.get.mockRejectedValue(repositoryError)

    await expect(useCase.execute('12345678900')).rejects.toThrow('Database error')

    expect(mockCustomerRepository.get).toHaveBeenCalledWith('12345678900')
  })
})

