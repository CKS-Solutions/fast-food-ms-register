import { ApiProperty } from '@nestjs/swagger';

export class CustomerListDto {
  @ApiProperty({ required: false })
  public readonly cpf?: string;

  @ApiProperty({ required: false })
  public readonly name?: string;

  @ApiProperty({ required: false })
  public readonly email?: string;

  @ApiProperty({ required: false })
  public readonly phone?: string;
}
