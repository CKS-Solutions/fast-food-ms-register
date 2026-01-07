import { CreateCustomerContainerFactory } from "@di/create-customer"
import { getRegion, getStage } from "@utils/env"
import { HTTPBadRequest, HTTPConflict, HTTPError, HTTPInternalServerError, HTTPSuccessResponse } from "@utils/http"
import { getRDSCredentials } from "@utils/rds"
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { CustomerDto } from "@dto/customer.dto"
import { ERROR_CODES } from "@shared/constants"

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const stage = getStage()
    const region = getRegion()

    const rdsCredentials = await getRDSCredentials(region, stage)
    const container = new CreateCustomerContainerFactory(rdsCredentials)

    const body = event.body ? JSON.parse(event.body) : null
    
    if (!body?.cpf || !body?.name) {
      throw new HTTPBadRequest("Missing required fields: cpf and name are required")
    }

    const customerDto: CustomerDto = {
      cpf: body.cpf,
      name: body.name,
      email: body.email || null,
      phone: body.phone || null,
    }

    const res = await container.usecase.execute(customerDto)

    return new HTTPSuccessResponse(res).toLambdaResponse()
  } catch (error) {
    if (error instanceof HTTPError) {
      console.error("HTTP error occurred:", error.message)
      return error.toLambdaResponse()
    }

    if (error instanceof Error && error.message === ERROR_CODES.CUSTOMER_ALREADY_EXISTS) {
      const conflictError = new HTTPConflict("Customer already exists")
      return conflictError.toLambdaResponse()
    }

    console.error("Unexpected error:", error)

    const genericError = new HTTPInternalServerError("Internal Server Error")
    return genericError.toLambdaResponse()
  }
}

