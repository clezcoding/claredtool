import { convertHtmlToPdf } from "./gotenberg.client";
import { EmptyHtmlError } from "./empty-html.error";

describe("convertHtmlToPdf", () => {
  const origFetch = globalThis.fetch;
  const origUser = process.env.GOTENBERG_API_BASIC_AUTH_USERNAME;
  const origPass = process.env.GOTENBERG_API_BASIC_AUTH_PASSWORD;
  const origUrl = process.env.GOTENBERG_URL;

  afterEach(() => {
    globalThis.fetch = origFetch;
    if (origUser === undefined) {
      delete process.env.GOTENBERG_API_BASIC_AUTH_USERNAME;
    } else {
      process.env.GOTENBERG_API_BASIC_AUTH_USERNAME = origUser;
    }
    if (origPass === undefined) {
      delete process.env.GOTENBERG_API_BASIC_AUTH_PASSWORD;
    } else {
      process.env.GOTENBERG_API_BASIC_AUTH_PASSWORD = origPass;
    }
    if (origUrl === undefined) {
      delete process.env.GOTENBERG_URL;
    } else {
      process.env.GOTENBERG_URL = origUrl;
    }
  });

  it("throws EmptyHtmlError and does not fetch when html is empty or whitespace", async () => {
    const fetchMock = jest.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    await expect(convertHtmlToPdf("")).rejects.toBeInstanceOf(EmptyHtmlError);
    await expect(convertHtmlToPdf("   \n")).rejects.toBeInstanceOf(
      EmptyHtmlError,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends UTF-8 html bytes as the multipart file body named index.html", async () => {
    process.env.GOTENBERG_API_BASIC_AUTH_USERNAME = "dev";
    process.env.GOTENBERG_API_BASIC_AUTH_PASSWORD = "dev";
    process.env.GOTENBERG_URL = "http://127.0.0.1:3000";
    const html = "<html><body>café — äöü</body></html>";
    const fetchMock = jest.fn().mockResolvedValue(
      new Response(new Uint8Array([0x25, 0x50, 0x44, 0x46]), { status: 200 }),
    );
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await convertHtmlToPdf(html);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/forms/chromium/convert/html");
    const form = init.body as FormData;
    const uploaded = form.get("files") as File;
    expect(uploaded).toBeInstanceOf(File);
    expect(uploaded.name).toBe("index.html");
    const bodyBytes = Buffer.from(await uploaded.arrayBuffer());
    expect(bodyBytes).toEqual(Buffer.from(html, "utf8"));
    expect(form.get("paperWidth")).toBe("8.27");
    expect(form.get("paperHeight")).toBe("11.7");
  });

  it("rejects non-PDF response bodies", async () => {
    process.env.GOTENBERG_API_BASIC_AUTH_USERNAME = "dev";
    process.env.GOTENBERG_API_BASIC_AUTH_PASSWORD = "dev";
    process.env.GOTENBERG_URL = "http://127.0.0.1:3000";
    globalThis.fetch = jest
      .fn()
      .mockResolvedValue(
        new Response(new TextEncoder().encode("<html>error</html>"), {
          status: 200,
        }),
      ) as unknown as typeof fetch;

    await expect(convertHtmlToPdf("<html>ok</html>")).rejects.toThrow(
      "Gotenberg response is not a PDF",
    );
  });
});
