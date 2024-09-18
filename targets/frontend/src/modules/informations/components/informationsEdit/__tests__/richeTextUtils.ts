export class ClipboardDataMock {
  getData: jest.Mock<string, [string]>;
  setData: jest.Mock<void, [string, string]>;

  constructor() {
    this.getData = jest.fn();
    this.setData = jest.fn();
  }
}

export class ClipboardEventMock extends Event {
  clipboardData: ClipboardDataMock;

  constructor(type: string, options?: EventInit) {
    super(type, options);
    this.clipboardData = new ClipboardDataMock();
  }
}

export class DataTransferMock {
  data: { [key: string]: string };

  constructor() {
    this.data = {};
  }

  setData(format: string, data: string): void {
    this.data[format] = data;
  }

  getData(format: string): string {
    return this.data[format] || "";
  }
}

export class DragEventMock extends Event {
  dataTransfer: DataTransferMock;

  constructor(type: string, options?: EventInit) {
    super(type, options);
    this.dataTransfer = new DataTransferMock();
  }
}
