import { act, renderHook } from "@testing-library/react";

import { useFormLock } from "../useFormLock";

const deferred = () => {
  let resolve: (value?: boolean) => void = () => {};
  const promise = new Promise<boolean | void>((r) => (resolve = r));
  return { promise, resolve };
};

describe("useFormLock", () => {
  it("ignore une action lancée pendant qu'une autre est en cours", async () => {
    const { result } = renderHook(() => useFormLock());
    const pending = deferred();
    const first = jest.fn(() => pending.promise);
    const second = jest.fn(() => Promise.resolve());

    let running: Promise<void> = Promise.resolve();
    act(() => {
      running = result.current.run("save", first);
      void result.current.run("publish", second);
      void result.current.run("save", first);
    });

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).not.toHaveBeenCalled();
    expect(result.current.saving).toBe(true);
    expect(result.current.busy).toBe(true);

    await act(async () => {
      pending.resolve();
      await running;
    });
    expect(result.current.busy).toBe(false);
  });

  it("libère le verrou après une erreur", async () => {
    const { result } = renderHook(() => useFormLock());

    await act(async () => {
      await expect(
        result.current.run("publish", () => Promise.reject(new Error("ko")))
      ).rejects.toThrow("ko");
    });

    expect(result.current.busy).toBe(false);
  });

  it("garde le verrou après un succès avec holdOnSuccess", async () => {
    const { result } = renderHook(() => useFormLock());
    const next = jest.fn(() => Promise.resolve());

    await act(async () => {
      await result.current.run("save", () => Promise.resolve(true), {
        holdOnSuccess: true,
      });
    });
    await act(async () => {
      await result.current.run("save", next);
    });

    expect(result.current.saving).toBe(true);
    expect(next).not.toHaveBeenCalled();
  });

  it("libère le verrou après un échec avec holdOnSuccess", async () => {
    const { result } = renderHook(() => useFormLock());

    await act(async () => {
      await result.current.run("save", () => Promise.resolve(false), {
        holdOnSuccess: true,
      });
    });

    expect(result.current.busy).toBe(false);
  });
});
