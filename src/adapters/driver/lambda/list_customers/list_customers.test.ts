import { handler } from './list_customers'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { ListCustomerContainerFactory } from '@di/list-customer'
import { getRegion, getStage } from '@utils/env'
import { getRDSCredentials } from '@utils/rds'
import { HTTPError, HTTPInternalServerError } from '@utils/http'
import { Customer } from '@entities/customer'

jest.mock('@di/list-customer')
jest.mock('@utils/env')
jest.mock('@utils/rds')
jest.mock('@aws/sm_client', () => ({
  SMClientWrapper: jest.fn(),
}))

describe('list_customers handler', () => {
  const mockGetRegion = getRegion as jest.MockedFunction<typeof getRegion>
  const mockGetStage = getStage as jest.MockedFunction<typeof getStage>
  const mockGetRDSCredentials = getRDSCredentials as jest.MockedFunction<typeof getRDSCredentials>
  const mockListCustomerContainerFactory = ListCustomerContainerFactory as jest.MockedClass<typeof ListCustomerContainerFactory>

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

  it('should list customers successfully with filters', async () => {
    const mockCustomers = [
      new Customer('12345678900', 'John Doe', 'john@example.com', '11999999999'),
      new Customer('98765432100', 'Jane Smith', 'jane@example.com', '11888888888'),
    ]
    const mockExecute = jest.fn().mockResolvedValue(mockCustomers)
    const mockContainer = {
      usecase: {
        execute: mockExecute,
      },
    }
    mockListCustomerContainerFactory.mockImplementation(() => mockContainer as any)

    const event = {
      queryStringParameters: {
        cpf: '12345678900',
        name: 'John',
      },
    } as unknown as APIGatewayProxyEvent

    const result = await handler(event)

    expect(mockGetRegion).toHaveBeenCalled()
    expect(mockGetStage).toHaveBeenCalled()
    expect(mockGetRDSCredentials).toHaveBeenCalledWith('us-east-1', 'api')
    expect(mockListCustomerContainerFactory).toHaveBeenCalledWith({
      host: 'localhost',
      user: 'user',
      password: 'pass',
    })
    expect(mockExecute).toHaveBeenCalledWith({
      cpf: '12345678900',
      name: 'John',
      email: undefined,
      phone: undefined,
    })
    expect(result.statusCode).toBe(200)
    expect(JSON.parse(result.body)).toEqual({ data: mockCustomers })
  })

  it('should list customers successfully without filters', async () => {
    const mockCustomers = [
      new Customer('12345678900', 'John Doe', 'john@example.com', '11999999999'),
    ]
    const mockExecute = jest.fn().mockResolvedValue(mockCustomers)
    const mockContainer = {
      usecase: {
        execute: mockExecute,
      },
    }
    mockListCustomerContainerFactory.mockImplementation(() => mockContainer as any)

    const event = {
      queryStringParameters: null,
    } as unknown as APIGatewayProxyEvent

    const result = await handler(event)

    expect(mockExecute).toHaveBeenCalledWith({
      cpf: undefined,
      name: undefined,
      email: undefined,
      phone: undefined,
    })
    expect(result.statusCode).toBe(200)
    expect(JSON.parse(result.body)).toEqual({ data: mockCustomers })
  })

  it('should return HTTPError response when HTTPError is thrown', async () => {
    const httpError = new HTTPError('Custom error', 400)
    const mockExecute = jest.fn().mockRejectedValue(httpError)
    const mockContainer = {
      usecase: {
        execute: mockExecute,
      },
    }
    mockListCustomerContainerFactory.mockImplementation(() => mockContainer as any)

    const event: APIGatewayProxyEvent = {
      queryStringParameters: {},
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
    mockListCustomerContainerFactory.mockImplementation(() => mockContainer as any)

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

    const event: APIGatewayProxyEvent = {
      queryStringParameters: {},
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

