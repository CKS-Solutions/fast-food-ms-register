import { RDSClientWrapper } from "@aws/rds_client";
import { Customer } from "@entities/customer";
import { ICustomerRepository } from "@ports/customer.repository";

const TABLE_NAME = 'customers';

export class CustomerRepository implements ICustomerRepository {
  constructor(private readonly client: RDSClientWrapper) {}

  async create(customer: Customer): Promise<Customer> {
    const now = Date.now();
    await this.client.connection(TABLE_NAME).insert({
      cpf: customer.cpf,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      created_at: now,
      updated_at: now,
    });

    return customer;
  }

  async get(cpf: string): Promise<Customer | null> {
    const result = await this.client.connection(TABLE_NAME).where({ cpf }).first();

    if (!result) {
      return null;
    }

    return new Customer(
      result.cpf,
      result.name,
      result.email,
      result.phone,
    );
  }

  async list(customerFilter: Partial<Customer>): Promise<Customer[]> {
    const query = this.client.connection(TABLE_NAME);

    if (customerFilter.cpf) {
      query.where({ cpf: customerFilter.cpf });
    }
    if (customerFilter.name) {
      query.where({ name: customerFilter.name });
    }
    if (customerFilter.email) {
      query.where({ email: customerFilter.email });
    }
    if (customerFilter.phone) {
      query.where({ phone: customerFilter.phone });
    }

    const results = await query.select();

    return results.map(result => new Customer(
      result.cpf,
      result.name,
      result.email,
      result.phone,
    ));
  }

  async update(cpf: string, customer: Omit<Customer, 'cpf'>): Promise<Customer> {
    await this.client.connection(TABLE_NAME)
      .where({ cpf })
      .update({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        updated_at: Date.now(),
      });

    const updated = await this.get(cpf);
    if (!updated) {
      throw new Error('Customer not found after update');
    }

    return updated;
  }

  async delete(cpf: string): Promise<void> {
    await this.client.connection(TABLE_NAME)
      .where({ cpf })
      .delete();
  }
}

