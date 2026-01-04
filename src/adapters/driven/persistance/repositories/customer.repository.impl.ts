import { ICustomerRepository } from '@ports/customer.repository';
import { PrismaService } from '../prisma.service';
import { Customer } from '@entities/customer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CustomerRepository implements ICustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async get(cpf: string): Promise<Customer | null> {
    const customer = await this.prisma.customer.findUnique({
      where: {
        cpf,
      },
    });

    if (!customer) return null;

    return Customer.fromDatabase(customer);
  }

  async list(customerFilter: Partial<Customer>): Promise<Customer[]> {
    const customers = await this.prisma.customer.findMany({
      where: customerFilter,
    });
    return customers.map((customer) => Customer.fromDatabase(customer));
  }

  async create(customer: Customer): Promise<Customer> {
    const customerSaved = await this.prisma.customer.create({
      data: {
        cpf: customer.cpf,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
    });

    return Customer.fromDatabase(customerSaved);
  }

  async update(
    cpf: string,
    customer: Omit<Customer, 'cpf'>,
  ): Promise<Customer> {
    const customerUpdated = await this.prisma.customer.update({
      where: {
        cpf: cpf,
      },
      data: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
    });

    return Customer.fromDatabase(customerUpdated);
  }

  async delete(cpf: string): Promise<void> {
    await this.prisma.customer.delete({
      where: {
        cpf,
      },
    });
  }
}
