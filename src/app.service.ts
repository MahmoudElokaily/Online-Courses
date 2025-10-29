import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  constructor(private dataSource: DataSource) {}

  onModuleInit() {
    if (this.dataSource.isInitialized) {
      console.log('✅ Database connection established!');
    } else {
      console.log('❌ Database not connected');
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}
