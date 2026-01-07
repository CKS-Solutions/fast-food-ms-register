import { handler } from './find_customer_by_cpf'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { FindClientByCpfContainerFactory } from '@di/find-client-by-cpf'
import { getRegion, getStage } from '@utils/env'
import { getRDSCredentials } from '@utils/rds'
import { HTTPBadRequest, HTTPError, HTTPInternalServerError, HTTPNotFound } from '@utils/http'
import { ERROR_CODES } from '@shared/constants'
import { Customer } from '@entities/customer'

jest.mock('@di/find-client-by-cpf')
jest.mock('@utils/env')
jest.mock('@utils/rds')
jest.mock('@aws/sm_client', () => ({
  SMClientWrapper: jest.fn(),
}))

describe('find_customer_by_cpf handler', () => {
  const mockGetRegion = getRegion as jest.MockedFunction<typeof getRegion>
  const mockGetStage = getStage as jest.MockedFunction<typeof getStage>
  const mockGetRDSCredentials = getRDSCredentials as jest.MockedFunction<typeof getRDSCredentials>
  const mockFindClientByCpfContainerFactory = FindClientByCpfContainerFactory as jest.MockedClass<typeof FindClientByCpfContainerFactory>

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

  it('should find customer by cpf successfully', async () => {
    const mockCustomer = new Customer('12345678900', 'John Doe', 'john@example.com', '11999999999')
    const mockExecute = jest.fn().mockResolvedValue(mockCustomer)
    const mockContainer = {
      usecase: {
        execute: mockExecute,
      },
    }
    mockFindClientByCpfContainerFactory.mockImplementation(() => mockContainer as any)

    const event = {
      pathParameters: {
        cpf: '12345678900',
      },
    } as unknown as APIGatewayProxyEvent

    const result = await handler(event)

    expect(mockGetRegion).toHaveBeenCalled()
    expect(mockGetStage).toHaveBeenCalled()
    expect(mockGetRDSCredentials).toHaveBeenCalledWith('us-east-1', 'api')
    expect(mockFindClientByCpfContainerFactory).toHaveBeenCalledWith({
      host: 'localhost',
      user: 'user',
      password: 'pass',
    })
    expect(mockExecute).toHaveBeenCalledWith('12345678900')
    expect(result.statusCode).toBe(200)
    expect(JSON.parse(result.body)).toEqual({ data: mockCustomer })
  })

  it('should return 400 when cpf is missing', async () => {
    const event = {
      pathParameters: null,
    } as unknown as APIGatewayProxyEvent

    const result = await handler(event)

    expect(result.statusCode).toBe(400)
    expect(JSON.parse(result.body)).toEqual({
      message: 'CPF is required in path parameters',
    })
  })

  it('should return 400 when cpf is undefined', async () => {
    const event = {
      pathParameters: {
        cpf: undefined,
      },
    } as unknown as APIGatewayProxyEvent

    const result = await handler(event)

    expect(result.statusCode).toBe(400)
    expect(JSON.parse(result.body)).toEqual({
      message: 'CPF is required in path parameters',
    })
  })

  it('should return 404 when customer not found', async () => {
    const mockExecute = jest.fn().mockRejectedValue(new Error(ERROR_CODES.CUSTOMER_NOT_FOUND))
    const mockContainer = {
      usecase: {
        execute: mockExecute,
      },
    }
    mockFindClientByCpfContainerFactory.mockImplementation(() => mockContainer as any)

    const event = {
      pathParameters: {
        cpf: '99999999999',
      },
    } as unknown as APIGatewayProxyEvent

    const result = await handler(event)

    expect(result.statusCode).toBe(404)
    expect(JSON.parse(result.body)).toEqual({
      message: 'Customer not found',
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
    mockFindClientByCpfContainerFactory.mockImplementation(() => mockContainer as any)

    const event = {
      pathParameters: {
        cpf: '12345678900',
      },
    } as unknown as APIGatewayProxyEvent

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
    mockFindClientByCpfContainerFactory.mockImplementation(() => mockContainer as any)

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

    const event = {
      pathParameters: {
        cpf: '12345678900',
      },
    } as unknown as APIGatewayProxyEvent

    const result = await handler(event)

    expect(result.statusCode).toBe(500)
    expect(JSON.parse(result.body)).toEqual({
      message: 'Internal Server Error',
    })
    expect(consoleErrorSpy).toHaveBeenCalledWith('Unexpected error:', expect.any(Error))

    consoleErrorSpy.mockRestore()
  })
})

