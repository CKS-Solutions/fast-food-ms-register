import { CustomerListDto } from '@dto/customer-list.dto';
import { CustomerDto } from '@dto/customer.dto';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateCustomerUseCase } from '@usecases/customer/create-customer.use-case';
import { FindClientByCpfUseCase } from '@usecases/customer/find-client-by-cpf.use-case';
import { ListCustomerUseCase } from '@usecases/customer/list-customer.use-case';

@Controller('customers')
export class CustomerController {
  constructor(
    private readonly createCustomerUseCase: CreateCustomerUseCase,
    private readonly listCustomerUseCase: ListCustomerUseCase,
    private readonly findClientByCpfUseCase: FindClientByCpfUseCase,
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
