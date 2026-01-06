import { Test, TestingModule } from '@nestjs/testing';
import { CreateCustomerUseCase } from '@usecases/create-customer/create-customer.use-case';
import { CUSTOMER_REPOSITORY_TOKEN } from '@ports/customer.repository';
import { CUSTOMER_SERVICE_TOKEN } from '@services/customer.service';
import { HttpException } from '@nestjs/common';
import { Customer } from '@entities/customer';
import { CustomerDto } from '@dto/customer.dto';
import { ICustomerRepository } from '@ports/customer.repository';
import { ICustomerService } from '@services/customer.service';

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
    mockCustomerDto.name,
    mockCustomerDto.email ?? '',
    mockCustomerDto.phone ?? '',
  );

  beforeEach(async () => {
    const mockRepository: jest.Mocked<ICustomerRepository> = {
      list: jest.fn(),
      create: jest.fn(),
      get: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const mockService: jest.Mocked<ICustomerService> = {
      create: jest.fn(),
      convertFiltersToModel: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCustomerUseCase,
        {
          provide: CUSTOMER_REPOSITORY_TOKEN,
          useValue: mockRepository,
        },
        {
          provide: CUSTOMER_SERVICE_TOKEN,
          useValue: mockService,
        },
      ],
    }).compile();

    createCustomerUseCase = module.get<CreateCustomerUseCase>(
      CreateCustomerUseCase,
    );
    customerRepository = module.get(CUSTOMER_REPOSITORY_TOKEN);
    customerService = module.get(CUSTOMER_SERVICE_TOKEN);
  });

  it('should create a customer when data is valid', async () => {
    jest.spyOn(customerRepository, 'list').mockResolvedValue([]);
    jest.spyOn(customerService, 'create').mockReturnValue(mockCustomer);
    jest.spyOn(customerRepository, 'create').mockResolvedValue(mockCustomer);

    const result = await createCustomerUseCase.execute(mockCustomerDto);

    expect(result).toEqual(mockCustomer);
  });

  it('should throw bad request when customer already exists', async () => {
    jest.spyOn(customerRepository, 'list').mockResolvedValue([mockCustomer]);

    await expect(
      createCustomerUseCase.execute(mockCustomerDto),
    ).rejects.toThrow(HttpException);
  });
});
