import { ApiProperty } from '@nestjs/swagger';

export class CustomerDto {
  @ApiProperty()
  public readonly cpf: string;

  @ApiProperty()
  public readonly name: string;

  @ApiProperty({ type: 'string', nullable: true })
  public readonly email: string | null;

  @ApiProperty({ type: 'string', nullable: true })
  public readonly phone: string | null;

  constructor(
    cpf: string,
    name: string,
    email: string | null,
    phone: string | null,
  ) {
    this.cpf = cpf;
    this.name = name;
    this.email = email;
    this.phone = phone;
  }
}
