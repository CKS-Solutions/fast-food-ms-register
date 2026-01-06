import { RDSClientWrapper } from "@aws/rds_client";
import { CustomerRepository } from "./customer";
import { Customer } from "@entities/customer";

jest.mock("@aws/rds_client", () => ({
  RDSClientWrapper: jest.fn(),
}));

describe('CustomerRepository', () => {
  describe('create', () => {
    it('should insert customer into the database and return the customer', async () => {
      const mockInsert = jest.fn().mockResolvedValue(undefined);
      const mockConnection = jest.fn().mockReturnValue({
        insert: mockInsert,
      });

      const rdsClient = {
        connection: mockConnection,
      } as unknown as RDSClientWrapper;
      
      const customerRepo = new CustomerRepository(rdsClient);

      const customer = new Customer(
        '12345678900',
        'John Doe',
        'john@example.com',
        '11999999999',
      );
      const result = await customerRepo.create(customer);

      expect(mockConnection).toHaveBeenCalledWith('customers');
      expect(mockInsert).toHaveBeenCalledWith({
        cpf: '12345678900',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '11999999999',
        created_at: expect.any(Number),
        updated_at: expect.any(Number),
      });
      expect(result).toBe(customer);
    });
  });

  describe('get', () => {
    it('should return a customer when found', async () => {
      const mockResult = {
        cpf: '12345678900',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '11999999999',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      };

      const mockFirst = jest.fn().mockResolvedValue(mockResult);
      const mockWhere = jest.fn().mockReturnValue({
        first: mockFirst,
      });
      const mockConnection = jest.fn().mockReturnValue({
        where: mockWhere,
      });
      const rdsClient = {
        connection: mockConnection,
      } as unknown as RDSClientWrapper;

      const customerRepo = new CustomerRepository(rdsClient);
      const result = await customerRepo.get('12345678900');
      
      expect(mockConnection).toHaveBeenCalledWith('customers');
      expect(mockWhere).toHaveBeenCalledWith({ cpf: '12345678900' });
      expect(result).toEqual(new Customer(
        '12345678900',
        'John Doe',
        'john@example.com',
        '11999999999',
      ));
    });

    it('should return null when customer not found', async () => {
      const mockFirst = jest.fn().mockResolvedValue(undefined);
      const mockWhere = jest.fn().mockReturnValue({
        first: mockFirst,
      });
      const mockConnection = jest.fn().mockReturnValue({
        where: mockWhere,
      });
      const rdsClient = {
        connection: mockConnection,
      } as unknown as RDSClientWrapper;

      const customerRepo = new CustomerRepository(rdsClient);
      const result = await customerRepo.get('non-existent-cpf');
      
      expect(mockConnection).toHaveBeenCalledWith('customers');
      expect(mockWhere).toHaveBeenCalledWith({ cpf: 'non-existent-cpf' });
      expect(result).toBeNull();
    });
  });

  describe('list', () => {
    it('should return a list of customers with filter by cpf', async () => {
      const mockResults = [
        {
          cpf: '12345678900',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '11999999999',
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
        },
      ];

      const mockSelect = jest.fn().mockResolvedValue(mockResults);
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        select: mockSelect,
      };
      const mockConnection = jest.fn().mockReturnValue(queryBuilder);

      const rdsClient = {
        connection: mockConnection,
      } as unknown as RDSClientWrapper;

      const customerRepo = new CustomerRepository(rdsClient);
      const results = await customerRepo.list({ cpf: '12345678900' });
      
      expect(mockConnection).toHaveBeenCalledWith('customers');
      expect(queryBuilder.where).toHaveBeenCalledWith({ cpf: '12345678900' });
      expect(mockSelect).toHaveBeenCalled();
      expect(results).toHaveLength(1);
      expect(results[0]).toBeInstanceOf(Customer);
      expect(results[0].cpf).toBe('12345678900');
    });

    it('should return a list of customers with filter by name', async () => {
      const mockResults = [
        {
          cpf: '12345678900',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '11999999999',
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
        },
      ];

      const mockSelect = jest.fn().mockResolvedValue(mockResults);
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        select: mockSelect,
      };
      const mockConnection = jest.fn().mockReturnValue(queryBuilder);

      const rdsClient = {
        connection: mockConnection,
      } as unknown as RDSClientWrapper;

      const customerRepo = new CustomerRepository(rdsClient);
      const results = await customerRepo.list({ name: 'John Doe' });
      
      expect(mockConnection).toHaveBeenCalledWith('customers');
      expect(queryBuilder.where).toHaveBeenCalledWith({ name: 'John Doe' });
      expect(mockSelect).toHaveBeenCalled();
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('John Doe');
    });

    it('should return all customers when no filter is provided', async () => {
      const mockResults = [
        {
          cpf: '12345678900',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '11999999999',
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
        },
        {
          cpf: '98765432100',
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '11888888888',
          created_at: new Date('2024-01-02'),
          updated_at: new Date('2024-01-02'),
        },
      ];

      const mockSelect = jest.fn().mockResolvedValue(mockResults);
      const mockConnection = jest.fn().mockReturnValue({
        select: mockSelect,
      });

      const rdsClient = {
        connection: mockConnection,
      } as unknown as RDSClientWrapper;

      const customerRepo = new CustomerRepository(rdsClient);
      const results = await customerRepo.list({});
      
      expect(mockConnection).toHaveBeenCalledWith('customers');
      expect(results).toHaveLength(2);
      expect(results[0]).toBeInstanceOf(Customer);
      expect(results[1]).toBeInstanceOf(Customer);
    });
  });

  describe('update', () => {
    it('should update the customer in the database and return the updated customer', async () => {
      const mockUpdate = jest.fn().mockResolvedValue(undefined);
      const mockWhere = jest.fn().mockReturnValue({
        update: mockUpdate,
      });
      const mockConnection = jest.fn().mockReturnValue({
        where: mockWhere,
      });

      const mockGetResult = {
        cpf: '12345678900',
        name: 'John Updated',
        email: 'john.updated@example.com',
        phone: '11777777777',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-02'),
      };

      const mockFirst = jest.fn().mockResolvedValue(mockGetResult);
      const mockWhereForGet = jest.fn().mockReturnValue({
        first: mockFirst,
      });
      const mockConnectionForGet = jest.fn()
        .mockReturnValueOnce({
          where: mockWhere,
        })
        .mockReturnValueOnce({
          where: mockWhereForGet,
        });

      const rdsClient = {
        connection: mockConnectionForGet,
      } as unknown as RDSClientWrapper;

      const customerRepo = new CustomerRepository(rdsClient);

      const customerUpdate = {
        name: 'John Updated',
        email: 'john.updated@example.com',
        phone: '11777777777',
      };

      const result = await customerRepo.update('12345678900', customerUpdate);

      expect(mockConnectionForGet).toHaveBeenCalledWith('customers');
      expect(mockWhere).toHaveBeenCalledWith({ cpf: '12345678900' });
      expect(mockUpdate).toHaveBeenCalledWith({
        name: 'John Updated',
        email: 'john.updated@example.com',
        phone: '11777777777',
        updated_at: expect.any(Number),
      });
      expect(result).toEqual(new Customer(
        '12345678900',
        'John Updated',
        'john.updated@example.com',
        '11777777777',
      ));
    });
  });

  describe('delete', () => {
    it('should delete the customer from the database', async () => {
      const mockDelete = jest.fn().mockResolvedValue(undefined);
      const mockWhere = jest.fn().mockReturnValue({
        delete: mockDelete,
      });
      const mockConnection = jest.fn().mockReturnValue({
        where: mockWhere,
      });
      const rdsClient = {
        connection: mockConnection,
      } as unknown as RDSClientWrapper;

      const customerRepo = new CustomerRepository(rdsClient);
      await customerRepo.delete('12345678900');

      expect(mockConnection).toHaveBeenCalledWith('customers');
      expect(mockWhere).toHaveBeenCalledWith({ cpf: '12345678900' });
      expect(mockDelete).toHaveBeenCalled();
    });
  });
});

