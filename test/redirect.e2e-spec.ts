import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";

import { Redirect } from "../src/redirect/redirect.schema";
import { RedirectModule } from "../src/redirect/redirect.module";
import { MemoryDBModule } from "./momoryDB.module";

jest.mock("short-uuid", () => ({
  default: {
    generate: jest.fn(() => "mocked-uuid"),
  },
}));

describe("Redirect", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [RedirectModule, MemoryDBModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await MemoryDBModule.closeDatabase();
    await app.close();
  });

  describe("POST t", () => {
    it(`should create redirect`, async () => {
      const res = await request(app.getHttpServer())
        .post("/t")
        .expect(201)
        .send({
          key: "TEST1",
          url: "https://2ip.ru",
          redirected: 0,
        } as Redirect);

      expect(res.body).toMatchObject({
        type: "item",
        item: {
          key: "TEST1",
          url: "https://2ip.ru",
          redirected: 0,
        },
      } as GORT<Redirect>["item"]);
    });

    it(`should create redirect`, async () => {
      const res = await request(app.getHttpServer())
        .post("/t")
        .expect(201)
        .send({
          key: "", // empty key should generate short-uuid
          url: "https://2ip.ru",
          redirected: 0,
        });

      expect(res.body).toMatchObject({
        type: "item",
        item: expect.objectContaining({
          key: expect.any(String) as string,
          url: "https://2ip.ru",
          redirected: 0,
        }) as Redirect,
      } as GORT<Redirect>["item"]);
    });

    it(`should get error`, async () => {
      const res = await request(app.getHttpServer())
        .post("/t")
        .expect(400)
        .send(); // no body

      expect(res.body).toMatchObject({
        type: "error",
        error: "BODY_MISSING",
      } as GORT["error"]);
    });

    it(`should get error`, async () => {
      const res = await request(app.getHttpServer())
        .post("/t")
        .expect(400)
        .send({
          key: "123456789012345678901", // length:21
          url: "https://2ip.ru",
          redirected: 0,
        } as Redirect);

      expect(res.body).toMatchObject({
        type: "error",
        error: "PROPERTY_LENGTH_INVALID",
        message: "key:maxlength:20",
      } as GORT["error"]);
    });

    it(`should get error`, async () => {
      const res = await request(app.getHttpServer())
        .post("/t")
        .expect(400)
        .send({
          key: "TEST2",
          url: "https ://2ip.ru", // wrong URL
          redirected: 0,
        } as Redirect);

      expect(res.body).toMatchObject({
        type: "error",
        error: "PROPERTY_VALIDATE",
        message: "url:validate:URL",
      } as GORT["error"]);
    });

    it(`should get error`, async () => {
      const res = await request(app.getHttpServer())
        .post("/t")
        .expect(400)
        .send({
          key: "TEST3",
          url: "", // empty URL
          redirected: 0,
        } as Redirect);

      expect(res.body).toMatchObject({
        type: "error",
        error: "PROPERTY_MISSING",
        message: "url:required:true",
      } as GORT["error"]);
    });

    it(`should get "redirected":0`, async () => {
      const res = await request(app.getHttpServer())
        .post("/t")
        .expect(201)
        .send({
          key: "TEST4",
          url: "https://2ip.ru",
          redirected: 100, // should be 0
        } as Redirect);

      expect(res.body).toMatchObject({
        type: "item",
        item: expect.objectContaining({
          key: "TEST4",
          url: "https://2ip.ru",
          redirected: 0,
        }) as GORT<Redirect>["item"]["item"],
      } as GORT<Redirect>["item"]);
    });

    it(`should get redirect with "redirected":1`, async () => {
      const res = await request(app.getHttpServer())
        .get("/t/TEST1")
        .expect(200)
        .send();

      expect(res.body).toMatchObject({
        type: "item",
        item: expect.objectContaining({
          key: "TEST1",
          url: "https://2ip.ru",
          redirected: 1,
        }) as GORT<Redirect>["item"]["item"],
      } as GORT<Redirect>["item"]);
    });

    it(`should delete redirect`, async () => {
      const res = await request(app.getHttpServer())
        .delete("/t/TEST1")
        .expect(200)
        .send();

      expect(res.body).toMatchObject({
        type: "success",
      } as GORT["success"]);
    });
  });
});
