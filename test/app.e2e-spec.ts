import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";

import { AppModule } from "../src/app.module";
import { MemoryDBModule } from "./momoryDB.module";

describe("AppController", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, MemoryDBModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await MemoryDBModule.closeDatabase();
    await app.close();
  });

  it(`GET /status`, async () => {
    const res = await request(app.getHttpServer()).get("/status").expect(200);

    expect(res.body).toMatchObject({
      type: "serverStatus",
      serverStatus: expect.objectContaining({
        cpuName: expect.any(String) as string,
        cpuSpeed: expect.any(String) as string,
        cpuThreads: expect.any(Number) as number,
        freeMem: expect.any(String) as string,
        platform: expect.any(String) as string,
        totalMem: expect.any(String) as string,
      }) as GORT["serverStatus"]["serverStatus"],
    } as GORT["serverStatus"]);
  });
});
