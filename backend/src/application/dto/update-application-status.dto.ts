import { IsIn } from 'class-validator';

export class UpdateApplicationStatusDto {
  @IsIn(['Accepted', 'Rejected'])
  status: 'Accepted' | 'Rejected';
}
