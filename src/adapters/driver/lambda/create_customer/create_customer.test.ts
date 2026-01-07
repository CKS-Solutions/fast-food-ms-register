import { handler } from './create_customer'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { CreateCustomerContainerFactory } from '@di/create-customer'
import { getRegion, getStage } from '@utils/env'
import { getRDSCredentials } from '@utils/rds'
import { HTTPBadRequest, HTTPConflict, HTTPError, HTTPInternalServerError } from '@utils/http'
import { ERROR_CODES } from '@shared/constants'
import { Customer } from '@entities/customer'

jest.mock('@di/create-customer')
jest.mock('@utils/env')
jest.mock('@utils/rds')
jest.mock('@aws/sm_client', () => ({
  SMClientWrapper: jest.fn(),
}))

describe('create_customer handler', () => {
  const mockGetRegion = getRegion as jest.MockedFunction<typeof getRegion>
  const mockGetStage = getStage as jest.MockedFunction<typeof getStage>
  const mockGetRDSCredentials = getRDSCredentials as jest.MockedFunction<typeof getRDSCredentials>
  const mockCreateCustomerContainerFactory = CreateCustomerContainerFactory as jest.MockedClass<typeof CreateCustomerContainerFactory>

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetRegion.mockReturnValue('us-east-1' as any)
    mockGetStage.mockReturnValue('api' as any)
    mockGetRDSCredentials.mockResolvedValue({
      host: 'localhost',
      user: 'user',
      password: 'pass',
    })
  })

  it('should create a customer successfully', async () => {
    const mockCustomer = new Customer('12345678900', 'John Doe', 'john@example.com', '11999999999')
    const mockExecute = jest.fn().mockResolvedValue(mockCustomer)
    const mockContainer = {
      usecase: {
        execute: mockExecute,
      },
    }
    mockCreateCustomerContainerFactory.mockImplementation(() => mockContainer as any)

    const event: APIGatewayProxyEvent = {
      body: JSON.stringify({
        cpf: '12345678900',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '11999999999',
      }),
    } as APIGatewayProxyEvent

    const result = await handler(event)

    expect(mockGetRegion).toHaveBeenCalled()
    expect(mockGetStage).toHaveBeenCalled()
    expect(mockGetRDSCredentials).toHaveBeenCalledWith('us-east-1', 'api')
    expect(mockCreateCustomerContainerFactory).toHaveBeenCalledWith({
      host: 'localhost',
      user: 'user',
      password: 'pass',
    })
    expect(mockExecute).toHaveBeenCalledWith({
      cpf: '12345678900',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '11999999999',
    })
    expect(result.statusCode).toBe(200)
    expect(JSON.parse(result.body)).toEqual({ data: mockCustomer })
  })

  it('should create a customer with optional fields as null', async () => {
    const mockCustomer = new Customer('12345678900', 'John Doe', '', '')
    const mockExecute = jest.fn().mockResolvedValue(mockCustomer)
    const mockContainer = {
      usecase: {
        execute: mockExecute,
      },
    }
    mockCreateCustomerContainerFactory.mockImplementation(() => mockContainer as any)

    const event: APIGatewayProxyEvent = {
      body: JSON.stringify({
        cpf: '12345678900',
        name: 'John Doe',
      }),
    } as APIGatewayProxyEvent

    const result = await handler(event)

    expect(mockExecute).toHaveBeenCalledWith({
      cpf: '12345678900',
      name: 'John Doe',
      email: null,
      phone: null,
    })
    expect(result.statusCode).toBe(200)
  })

  it('should return 400 when body is missing', async () => {
    const event: APIGatewayProxyEvent = {
      body: null,
    } as APIGatewayProxyEvent

    const result = await handler(event)

    expect(result.statusCode).toBe(400)
    expect(JSON.parse(result.body)).toEqual({
      message: 'Missing required fields: cpf and name are required',
    })
  })

  it('should return 400 when cpf is missing', async () => {
    const event: APIGatewayProxyEvent = {
      body: JSON.stringify({
        name: 'John Doe',
      }),
    } as APIGatewayProxyEvent

    const result = await handler(event)

    expect(result.statusCode).toBe(400)
    expect(JSON.parse(result.body)).toEqual({
      message: 'Missing required fields: cpf and name are required',
    })
  })

  it('should return 400 when name is missing', async () => {
    const event: APIGatewayProxyEvent = {
      body: JSON.stringify({
        cpf: '12345678900',
      }),
    } as APIGatewayProxyEvent

    const result = await handler(event)

    expect(result.statusCode).toBe(400)
    expect(JSON.parse(result.body)).toEqual({
      message: 'Missing required fields: cpf and name are required',
    })
  })

  it('should return 409 when customer already exists', async () => {
    const mockExecute = jest.fn().mockRejectedValue(new Error(ERROR_CODES.CUSTOMER_ALREADY_EXISTS))
    const mockContainer = {
      usecase: {
        execute: mockExecute,
      },
    }
    mockCreateCustomerContainerFactory.mockImplementation(() => mockContainer as any)

    const event: APIGatewayProxyEvent = {
      body: JSON.stringify({
        cpf: '12345678900',
        name: 'John Doe',
      }),
    } as APIGatewayProxyEvent

    const result = await handler(event)

    expect(result.statusCode).toBe(409)
    expect(JSON.parse(result.body)).toEqual({
      message: 'Customer already exists',
    })
  })

  it('should return HTTPError response when HTTPError is thrown', async () => {
    const httpError = new HTTPBadRequest('Custom error')
    const mockExecute = jest.fn().mockRejectedValue(httpError)
    const mockContainer = {
      usecase: {
        execute: mockExecute,
      },
    }
    mockCreateCustomerContainerFactory.mockImplementation(() => mockContainer as any)

    const event: APIGatewayProxyEvent = {
      body: JSON.stringify({
        cpf: '12345678900',
        name: 'John Doe',
      }),
    } as APIGatewayProxyEvent

    const result = await handler(event)

    expect(result.statusCode).toBe(400)
    expect(JSON.parse(result.body)).toEqual({
      message: 'Custom error',
    })
  })

  it('should return 500 when unexpected error occurs', async () => {
    const mockExecute = jest.fn().mockRejectedValue(new Error('Unexpected error'))
    const mockContainer = {
      usecase: {
        execute: mockExecute,
      },
    }
    mockCreateCustomerContainerFactory.mockImplementation(() => mockContainer as any)

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

    const event: APIGatewayProxyEvent = {
      body: JSON.stringify({
        cpf: '12345678900',
        name: 'John Doe',
      }),
    } as APIGatewayProxyEvent

    const result = await handler(event)

    expect(result.statusCode).toBe(500)
    expect(JSON.parse(result.body)).toEqual({
      message: 'Internal Server Error',
    })
    expect(consoleErrorSpy).toHaveBeenCalledWith('Unexpected error:', expect.any(Error))

    consoleErrorSpy.mockRestore()
  })
})

