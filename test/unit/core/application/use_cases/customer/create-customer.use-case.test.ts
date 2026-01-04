import { Test, TestingModule } from '@nestjs/testing';
import { CreateCustomerUseCase } from '@usecases/customer/create-customer.use-case';
import { CustomerRepository } from '@repositories/customer.repository.impl';
import { CustomerService } from '@services/customer.service';
import { HttpException } from '@nestjs/common';
import { Customer } from '@entities/customer';
import { CustomerDto } from '@dto/customer.dto';

describe('CreateCustomerUseCase', () => {
  let createCustomerUseCase: CreateCustomerUseCase;
  let customerRepository: CustomerRepository;
  let customerService: CustomerService;

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
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCustomerUseCase,
        {
          provide: CustomerRepository,
          useValue: {
            list: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: CustomerService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    createCustomerUseCase = module.get<CreateCustomerUseCase>(
      CreateCustomerUseCase,
    );
    customerRepository = module.get<CustomerRepository>(CustomerRepository);
    customerService = module.get<CustomerService>(CustomerService);
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
