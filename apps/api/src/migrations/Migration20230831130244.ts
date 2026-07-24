import { Migration } from '@mikro-orm/migrations';

export class Migration20230831130244 extends Migration {

  async up(): Promise<void> {
    this.addSql('select 1');
  }

}
