import { ListCustomerUseCase } from './list-customer.use-case'
import { ICustomerRepository } from '@ports/customer.repository'
import { ICustomerService } from '@services/customer.service'
import { Customer } from '@entities/customer'
import { CustomerListDto } from '@dto/customer-list.dto'

describe('ListCustomerUseCase', () => {
  let useCase: ListCustomerUseCase
  let mockCustomerRepository: jest.Mocked<ICustomerRepository>
  let mockCustomerService: jest.Mocked<ICustomerService>

  beforeEach(() => {
    mockCustomerRepository = {
      get: jest.fn(),
      list: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }

    mockCustomerService = {
      create: jest.fn(),
      convertFiltersToModel: jest.fn(),
    }

    useCase = new ListCustomerUseCase(mockCustomerRepository, mockCustomerService)
  })

  it('should return list of customers with filters', async () => {
    const filters: CustomerListDto = {
      cpf: '12345678900',
      name: 'John',
    }

    const filtersModel = {
      cpf: '12345678900',
      name: 'John',
    }

    const mockCustomers = [
      new Customer('12345678900', 'John Doe', 'john@example.com', '11999999999'),
    ]

    mockCustomerService.convertFiltersToModel.mockReturnValue(filtersModel)
    mockCustomerRepository.list.mockResolvedValue(mockCustomers)

    const result = await useCase.execute(filters)

    expect(mockCustomerService.convertFiltersToModel).toHaveBeenCalledWith(filters)
    expect(mockCustomerRepository.list).toHaveBeenCalledWith(filtersModel)
    expect(result).toEqual(mockCustomers)
  })

  it('should return list of customers without filters', async () => {
    const filters: CustomerListDto = {}

    const filtersModel = {}

    const mockCustomers = [
      new Customer('12345678900', 'John Doe', 'john@example.com', '11999999999'),
      new Customer('98765432100', 'Jane Smith', 'jane@example.com', '11888888888'),
    ]

    mockCustomerService.convertFiltersToModel.mockReturnValue(filtersModel)
    mockCustomerRepository.list.mockResolvedValue(mockCustomers)

    const result = await useCase.execute(filters)

    expect(mockCustomerService.convertFiltersToModel).toHaveBeenCalledWith(filters)
    expect(mockCustomerRepository.list).toHaveBeenCalledWith(filtersModel)
    expect(result).toEqual(mockCustomers)
  })

  it('should return empty list when no customers found', async () => {
    const filters: CustomerListDto = {
      cpf: '99999999999',
    }

    const filtersModel = {
      cpf: '99999999999',
    }

    mockCustomerService.convertFiltersToModel.mockReturnValue(filtersModel)
    mockCustomerRepository.list.mockResolvedValue([])

    const result = await useCase.execute(filters)

    expect(mockCustomerService.convertFiltersToModel).toHaveBeenCalledWith(filters)
    expect(mockCustomerRepository.list).toHaveBeenCalledWith(filtersModel)
    expect(result).toEqual([])
  })

  it('should throw error when repository throws error', async () => {
    const filters: CustomerListDto = {}
    const filtersModel = {}
    const repositoryError = new Error('Database error')

    mockCustomerService.convertFiltersToModel.mockReturnValue(filtersModel)
    mockCustomerRepository.list.mockRejectedValue(repositoryError)

    await expect(useCase.execute(filters)).rejects.toThrow('Database error')

    expect(mockCustomerService.convertFiltersToModel).toHaveBeenCalledWith(filters)
    expect(mockCustomerRepository.list).toHaveBeenCalledWith(filtersModel)
  })
})

