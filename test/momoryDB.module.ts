import { Module, Global } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async () => {
        MemoryDBModule.mongod = await MongoMemoryServer.create();
        const uri = MemoryDBModule.mongod.getUri();

        return { uri };
      },
    }),
  ],
  exports: [MongooseModule],
})
export class MemoryDBModule {
  private static mongod: MongoMemoryServer;

  static async closeDatabase() {
    await mongoose.disconnect();
    await this.mongod.stop();
  }
}
