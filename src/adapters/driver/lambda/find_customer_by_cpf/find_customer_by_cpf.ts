import { FindClientByCpfContainerFactory } from "@di/find-client-by-cpf"
import { getRegion, getStage } from "@utils/env"
import { HTTPBadRequest, HTTPError, HTTPInternalServerError, HTTPNotFound, HTTPSuccessResponse } from "@utils/http"
import { getRDSCredentials } from "@utils/rds"
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { ERROR_CODES } from "@shared/constants"

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const stage = getStage()
    const region = getRegion()

    const rdsCredentials = await getRDSCredentials(region, stage)
    const container = new FindClientByCpfContainerFactory(rdsCredentials)

    const cpf = event.pathParameters?.cpf
    
    if (!cpf) {
      throw new HTTPBadRequest("CPF is required in path parameters")
    }

    const res = await container.usecase.execute(cpf)

    return new HTTPSuccessResponse(res).toLambdaResponse()
  } catch (error) {
    if (error instanceof HTTPError) {
      console.error("HTTP error occurred:", error.message)
      return error.toLambdaResponse()
    }

    if (error instanceof Error && error.message === ERROR_CODES.CUSTOMER_NOT_FOUND) {
      const notFoundError = new HTTPNotFound("Customer not found")
      return notFoundError.toLambdaResponse()
    }

    console.error("Unexpected error:", error)

    const genericError = new HTTPInternalServerError("Internal Server Error")
    return genericError.toLambdaResponse()
  }
}

