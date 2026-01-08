import { loadFeature, defineFeature } from 'jest-cucumber';
import { CreateCustomerUseCase } from './create-customer.use-case';
import { Customer } from '@entities/customer';
import { CustomerDto } from '@dto/customer.dto';
import { ICustomerRepository } from '@ports/customer.repository';
import { ICustomerService } from '@services/customer.service';
import path from 'path';

const feature = loadFeature(path.join(__dirname, 'create-customer.feature'));

defineFeature(feature, (test) => {
  let createCustomerUseCase: CreateCustomerUseCase;
  let customerRepository: jest.Mocked<ICustomerRepository>;
  let customerService: jest.Mocked<ICustomerService>;
  let result: Customer;
  let customerDto: CustomerDto;
  let errorThrown: Error | null;

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

    result = null as any;
    customerDto = null as any;
    errorThrown = null;
  });

  test('Criar cliente com dados válidos', ({ given, when, then, and }) => {
    given(/^que não existe um cliente com CPF "(.*)"$/, async (cpf) => {
      customerRepository.list.mockResolvedValue([]);
    });

    when(/^eu criar um cliente com os seguintes dados:$/, async (table) => {
      const data = table[0];
      customerDto = {
        cpf: data.cpf,
        name: data.name,
        email: data.email,
        phone: data.phone,
      };

      const mockCustomer = new Customer(
        customerDto.cpf,
        customerDto.name ?? '',
        customerDto.email ?? '',
        customerDto.phone ?? '',
      );

      customerService.create.mockReturnValue(mockCustomer);
      customerRepository.create.mockResolvedValue(mockCustomer);

      result = await createCustomerUseCase.execute(customerDto);
    });

    then('o cliente deve ser criado com sucesso', async () => {
      expect(result).toBeDefined();
      expect(customerRepository.create).toHaveBeenCalled();
      expect(customerService.create).toHaveBeenCalledWith(customerDto);
    });

    and(/^o cliente retornado deve ter CPF "(.*)"$/, async (cpf) => {
      expect(result.cpf).toBe(cpf);
    });

    and(/^o cliente retornado deve ter nome "(.*)"$/, async (name) => {
      expect(result.name).toBe(name);
    });
  });

  test('Tentar criar cliente que já existe', ({ given, when, then, and }) => {
    given(/^que já existe um cliente com CPF "(.*)"$/, async (cpf) => {
      const existingCustomer = new Customer(
        cpf,
        'Existing Customer',
        'existing@example.com',
        '11999999999',
      );
      customerRepository.list.mockResolvedValue([existingCustomer]);
    });

    when(/^eu tentar criar um cliente com CPF "(.*)"$/, async (cpf) => {
      customerDto = {
        cpf: cpf,
        name: 'New Customer',
        email: 'new@example.com',
        phone: '11888888888',
      };

      try {
        await createCustomerUseCase.execute(customerDto);
      } catch (error) {
        errorThrown = error as Error;
      }
    });

    then(/^deve ser lançado um erro "(.*)"$/, async (errorCode) => {
      expect(errorThrown).not.toBeNull();
      expect(errorThrown?.message).toBe(errorCode);
    });

    and('o cliente não deve ser criado', async () => {
      expect(customerRepository.create).not.toHaveBeenCalled();
      expect(customerService.create).not.toHaveBeenCalled();
    });
  });
});

