/* eslint-disable @typescript-eslint/no-empty-function */
import pathModule from "path";
import handlebars from "express-handlebars";
import { tryItOutJsMinFileName } from "redocly-try-it-out";
import { AdapterHandler, NotImplementedError } from "./adapter-handler";

describe("AdapterHandler", () => {
  describe("FastifyAdapter", () => {
    it("Should throw NotImplementedError", async () => {
      const fastifyAdapter = new (function FastifyAdapter() {})();
      await expect(
        AdapterHandler.init(fastifyAdapter, "test", {} as any, {}).handle()
      ).rejects.toThrow(NotImplementedError);
    });
  });

  describe("ExpressAdapter", () => {
    let expressAdapter;

    beforeEach((): void => {
      expressAdapter = new (function ExpressAdapter() {})();
      expressAdapter.get = jest.fn();
    });

    const getResponse = (
      path: string
    ): { setHeader: jest.Mock; send: jest.Mock; sendFile: jest.Mock } => {
      const [, callback] = expressAdapter.get.mock.calls.find(
        (call) => call[0] == path
      );
      const res = {
        setHeader: jest.fn(),
        send: jest.fn(),
        sendFile: jest.fn(),
      };
      callback({}, res);
      return res;
    };

    it("Should configure doc url", async () => {
      const document = { title: "testing" };
      await AdapterHandler.init(expressAdapter, "/test", document as any, {
        docName: "swagger",
      }).handle();
      expect(expressAdapter.get).toBeCalledWith(
        "/test/swagger.json",
        expect.any(Function)
      );
      const res = getResponse("/test/swagger.json");
      expect(res.setHeader).toBeCalledWith("Content-Type", "application/json");
      expect(res.send).toBeCalledWith(document);
    });

    it("Should configure redoc html", async () => {
      const document = {} as any;
      const renderedHTMLMock = "custom rendered html";
      const renderSpy = jest.fn(() => renderedHTMLMock);
      handlebars.create = jest
        .fn()
        .mockImplementation(() => ({ render: renderSpy }));
      const options = { docName: "swagger" };
      const path = "/test";
      await AdapterHandler.init(
        expressAdapter,
        path,
        document,
        options
      ).handle();
      expect(expressAdapter.get).toBeCalledWith(path, expect.any(Function));
      expect(renderSpy).toHaveBeenCalledWith(
        pathModule.join(__dirname, "..", "views", "view.handlebars"),
        {
          tryItOutJsMinFileName,
          path,
          docUrl: "/test/swagger.json",
          options,
          document,
        }
      );
      const res = getResponse("/test");
      expect(res.send).toBeCalledWith(renderedHTMLMock);
    });

    it("Should configure js file delivering", async () => {
      const pathToModule = require.resolve("redocly-try-it-out");
      await AdapterHandler.init(
        expressAdapter,
        "/test",
        {} as any,
        {}
      ).handle();
      expect(expressAdapter.get).toBeCalledWith(
        `/test/${tryItOutJsMinFileName}`,
        expect.any(Function)
      );
      const res = getResponse(`/test/${tryItOutJsMinFileName}`);
      expect(res.setHeader).toBeCalledWith("Content-Type", "plain/text");
      expect(res.sendFile).toBeCalledWith(
        pathModule.join(pathModule.dirname(pathToModule), tryItOutJsMinFileName)
      );
    });
  });
});
