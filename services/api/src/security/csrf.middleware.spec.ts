import { ForbiddenException } from "@nestjs/common";
import type { Request, Response } from "express";
import { CsrfMiddleware } from "./csrf.middleware";

describe("CsrfMiddleware", () => {
  const middleware = new CsrfMiddleware();

  it("allows safe methods", () => {
    const next = jest.fn();

    middleware.use(makeRequest({ method: "GET", path: "/api/v1/wardrobe" }), {} as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("blocks authenticated mutations without a matching CSRF token", () => {
    const next = jest.fn();
    const request = makeRequest({
      method: "POST",
      path: "/api/v1/wardrobe/items",
      cookies: { closira_access: "access", closira_csrf: "cookie-token" },
      headers: { "x-csrf-token": "wrong-token" }
    });

    expect(() => middleware.use(request, {} as Response, next)).toThrow(ForbiddenException);
    expect(next).not.toHaveBeenCalled();
  });

  it("allows authenticated mutations with a matching CSRF token", () => {
    const next = jest.fn();
    const request = makeRequest({
      method: "POST",
      path: "/api/v1/wardrobe/items",
      cookies: { closira_access: "access", closira_csrf: "cookie-token" },
      headers: { "x-csrf-token": "cookie-token" }
    });

    middleware.use(request, {} as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});

function makeRequest(input: Partial<Request>) {
  return {
    method: input.method,
    path: input.path,
    cookies: input.cookies ?? {},
    headers: input.headers ?? {}
  } as Request;
}
