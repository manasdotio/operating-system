import { describe, it, expect, beforeEach } from "vitest";
import { vfs } from "./vfs";

describe("Virtual File System (VFS)", () => {
  beforeEach(() => {
    vfs.reset();
  });

  it("should initialize with default folders and files", () => {
    expect(vfs.exists([])).toBe(true);
    expect(vfs.exists(["Documents"])).toBe(true);
    expect(vfs.exists(["Pictures"])).toBe(true);
    expect(vfs.exists(["Documents", "welcome.txt"])).toBe(true);
  });

  it("should correctly resolve paths with '..' and relative segments", () => {
    expect(vfs.resolvePath(["Documents"], "..")).toEqual([]);
    expect(vfs.resolvePath(["Documents"], "projects.md")).toEqual(["Documents", "projects.md"]);
    expect(vfs.resolvePath(["Documents"], "/Pictures/logo.svg")).toEqual(["Pictures", "logo.svg"]);
    expect(vfs.resolvePath([], "~/Documents")).toEqual(["Documents"]);
  });

  it("should write and read text files accurately", () => {
    const testContent = "Hello from automated test!";
    vfs.writeFile(["Documents", "test.txt"], testContent);

    expect(vfs.exists(["Documents", "test.txt"])).toBe(true);
    const read = vfs.readFile(["Documents", "test.txt"]);
    expect(read).toBe(testContent);
  });

  it("should create directories and prevent duplicate creation", () => {
    vfs.mkdir(["Projects"]);
    expect(vfs.exists(["Projects"])).toBe(true);

    const dirNode = vfs.getNode(["Projects"]);
    expect(dirNode.type).toBe("dir");
    expect(dirNode.children).toEqual([]);

    expect(() => vfs.mkdir(["Projects"])).toThrow(/already exists/);
  });

  it("should delete (unlink) files and folders", () => {
    vfs.writeFile(["test_delete.txt"], "temporary");
    expect(vfs.exists(["test_delete.txt"])).toBe(true);

    vfs.unlink(["test_delete.txt"]);
    expect(vfs.exists(["test_delete.txt"])).toBe(false);
  });

  it("should rename files correctly", () => {
    vfs.writeFile(["old_name.txt"], "rename me");
    vfs.rename(["old_name.txt"], "new_name.txt");

    expect(vfs.exists(["old_name.txt"])).toBe(false);
    expect(vfs.exists(["new_name.txt"])).toBe(true);
    expect(vfs.readFile(["new_name.txt"])).toBe("rename me");
  });

  it("should notify subscribers when mutations occur", () => {
    let notified = false;
    const unsub = vfs.subscribe(() => {
      notified = true;
    });

    vfs.writeFile(["sub_test.txt"], "sub");
    expect(notified).toBe(true);
    unsub();
  });

  it("should calculate storage stats accurately", () => {
    const stats = vfs.getStorageStats();
    expect(stats.fileCount).toBeGreaterThan(0);
    expect(stats.dirCount).toBeGreaterThan(0);
    expect(stats.totalBytes).toBeGreaterThan(0);
  });
});
