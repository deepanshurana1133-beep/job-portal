import { IsIn } from 'class-validator';

export class UpdateApplicationStatusDto {
  @IsIn(['Pending', 'Accepted', 'Rejected'])
  status: 'Pending' | 'Accepted' | 'Rejected';
}
