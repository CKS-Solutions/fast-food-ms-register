import { CustomerListDto } from '@dto/customer-list.dto';
import { CustomerDto } from '@dto/customer.dto';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Inject,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  ICreateCustomerUseCase,
  CREATE_CUSTOMER_USE_CASE_TOKEN,
} from '@usecases/create-customer/create-customer.use-case';
import {
  IFindClientByCpfUseCase,
  FIND_CLIENT_BY_CPF_USE_CASE_TOKEN,
} from '@usecases/find-client-by-cpf/find-client-by-cpf.use-case';
import {
  IListCustomerUseCase,
  LIST_CUSTOMER_USE_CASE_TOKEN,
} from '@usecases/list-customer/list-customer.use-case';

@Controller('customers')
export class CustomerController {
  constructor(
    @Inject(CREATE_CUSTOMER_USE_CASE_TOKEN)
    private readonly createCustomerUseCase: ICreateCustomerUseCase,
    @Inject(LIST_CUSTOMER_USE_CASE_TOKEN)
    private readonly listCustomerUseCase: IListCustomerUseCase,
    @Inject(FIND_CLIENT_BY_CPF_USE_CASE_TOKEN)
    private readonly findClientByCpfUseCase: IFindClientByCpfUseCase,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new customer',
    description: 'Create a new customer',
  })
  @ApiResponse({
    status: 201,
    description: 'The customer has been successfully created.',
  })
  async create(@Body() customer: CustomerDto) {
    return await this.createCustomerUseCase.execute(customer);
  }

  @Get()
  @ApiOperation({
    summary: 'List customers',
    description: 'List customers',
  })
  @ApiResponse({
    status: 200,
    description: 'The customers have been successfully listed.',
  })
  async list(@Query() params: CustomerListDto) {
    return await this.listCustomerUseCase.execute(params);
  }

  @Get(':cpf')
  @ApiOperation({
    summary: 'Find customer by cpf',
    description: 'Find customer by cpf',
  })
  @ApiResponse({
    status: 200,
    description: 'The customer has been successfully found.',
  })
  async findByCpf(@Param('cpf') cpf: string) {
    return await this.findClientByCpfUseCase.execute(cpf);
  }
}
