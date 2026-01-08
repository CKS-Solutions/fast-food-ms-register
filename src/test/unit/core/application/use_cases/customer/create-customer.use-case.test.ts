import { CreateCustomerUseCase } from '@usecases/create-customer/create-customer.use-case';
import { Customer } from '@entities/customer';
import { CustomerDto } from '@dto/customer.dto';
import { ICustomerRepository } from '@ports/customer.repository';
import { ICustomerService } from '@services/customer.service';
import { ERROR_CODES } from '@shared/constants';

describe('CreateCustomerUseCase', () => {
  let createCustomerUseCase: CreateCustomerUseCase;
  let customerRepository: jest.Mocked<ICustomerRepository>;
  let customerService: jest.Mocked<ICustomerService>;

  const mockCustomerDto: CustomerDto = {
    cpf: '12312312312',
    name: 'Julia Strain',
    email: 'julia@gmail.com',
    phone: '47999999999',
  };

  const mockCustomer: Customer = new Customer(
    mockCustomerDto.cpf,
    mockCustomerDto.name ?? '',
    mockCustomerDto.email ?? '',
    mockCustomerDto.phone ?? '',
  );

  beforeEach(() => {
    customerRepository = {
      list: jest.fn(),
      create: jest.fn(),
      get: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<ICustomerRepository>;

    customerService = {
      create: jest.fn(),
      convertFiltersToModel: jest.fn(),
    } as jest.Mocked<ICustomerService>;

    createCustomerUseCase = new CreateCustomerUseCase(
      customerRepository,
      customerService,
    );
  });

  it('should create a customer when data is valid', async () => {
    jest.spyOn(customerRepository, 'list').mockResolvedValue([]);
    jest.spyOn(customerService, 'create').mockReturnValue(mockCustomer);
    jest.spyOn(customerRepository, 'create').mockResolvedValue(mockCustomer);

    const result = await createCustomerUseCase.execute(mockCustomerDto);

    expect(result).toEqual(mockCustomer);
    expect(customerRepository.list).toHaveBeenCalledWith({
      cpf: mockCustomerDto.cpf,
    });
    expect(customerService.create).toHaveBeenCalledWith(mockCustomerDto);
    expect(customerRepository.create).toHaveBeenCalledWith(mockCustomer);
  });

  it('should throw error when customer already exists', async () => {
    jest.spyOn(customerRepository, 'list').mockResolvedValue([mockCustomer]);

    await expect(
      createCustomerUseCase.execute(mockCustomerDto),
    ).rejects.toThrow(ERROR_CODES.CUSTOMER_ALREADY_EXISTS);

    expect(customerRepository.list).toHaveBeenCalledWith({
      cpf: mockCustomerDto.cpf,
    });
    expect(customerService.create).not.toHaveBeenCalled();
    expect(customerRepository.create).not.toHaveBeenCalled();
  });
});
