import { CustomerService } from './customer.service'
import { Customer } from '@entities/customer'
import { CustomerDto } from '@dto/customer.dto'
import { CustomerListDto } from '@dto/customer-list.dto'

describe('CustomerService', () => {
  let service: CustomerService

  beforeEach(() => {
    service = new CustomerService()
  })

  describe('create', () => {
    it('should create a customer with all fields', () => {
      const customerDto: CustomerDto = {
        cpf: '12345678900',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '11999999999',
      }

      const result = service.create(customerDto)

      expect(result).toBeInstanceOf(Customer)
      expect(result.cpf).toBe('12345678900')
      expect(result.name).toBe('John Doe')
      expect(result.email).toBe('john@example.com')
      expect(result.phone).toBe('11999999999')
    })

    it('should create a customer with null email and phone', () => {
      const customerDto: CustomerDto = {
        cpf: '12345678900',
        name: 'John Doe',
        email: null,
        phone: null,
      }

      const result = service.create(customerDto)

      expect(result).toBeInstanceOf(Customer)
      expect(result.cpf).toBe('12345678900')
      expect(result.name).toBe('John Doe')
      expect(result.email).toBe('')
      expect(result.phone).toBe('')
    })

    it('should create a customer with only required fields', () => {
      const customerDto: CustomerDto = {
        cpf: '12345678900',
        name: 'John Doe',
        email: null,
        phone: null,
      }

      const result = service.create(customerDto)

      expect(result).toBeInstanceOf(Customer)
      expect(result.cpf).toBe('12345678900')
      expect(result.name).toBe('John Doe')
      expect(result.email).toBe('')
      expect(result.phone).toBe('')
    })
  })

  describe('convertFiltersToModel', () => {
    it('should convert filters with all fields', () => {
      const filters: CustomerListDto = {
        cpf: '12345678900',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '11999999999',
      }

      const result = service.convertFiltersToModel(filters)

      expect(result).toEqual({
        cpf: '12345678900',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '11999999999',
      })
    })

    it('should convert filters with only cpf', () => {
      const filters: CustomerListDto = {
        cpf: '12345678900',
      }

      const result = service.convertFiltersToModel(filters)

      expect(result).toEqual({
        cpf: '12345678900',
      })
    })

    it('should convert filters with only name', () => {
      const filters: CustomerListDto = {
        name: 'John Doe',
      }

      const result = service.convertFiltersToModel(filters)

      expect(result).toEqual({
        name: 'John Doe',
      })
    })

    it('should convert filters with only email', () => {
      const filters: CustomerListDto = {
        email: 'john@example.com',
      }

      const result = service.convertFiltersToModel(filters)

      expect(result).toEqual({
        email: 'john@example.com',
      })
    })

    it('should convert filters with only phone', () => {
      const filters: CustomerListDto = {
        phone: '11999999999',
      }

      const result = service.convertFiltersToModel(filters)

      expect(result).toEqual({
        phone: '11999999999',
      })
    })

    it('should return empty object when no filters provided', () => {
      const filters: CustomerListDto = {}

      const result = service.convertFiltersToModel(filters)

      expect(result).toEqual({})
    })

    it('should ignore undefined fields', () => {
      const filters: CustomerListDto = {
        cpf: '12345678900',
        name: undefined,
        email: 'john@example.com',
        phone: undefined,
      }

      const result = service.convertFiltersToModel(filters)

      expect(result).toEqual({
        cpf: '12345678900',
        email: 'john@example.com',
      })
    })
  })
})

