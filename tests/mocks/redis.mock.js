const redisMock = {
  get: jest.fn(),
  set: jest.fn(),
  setex: jest.fn(),
  del: jest.fn(),
  incr: jest.fn(),
  expire: jest.fn(),
  keys: jest.fn(),
  flushall: jest.fn(),
  quit: jest.fn(),
};

export default redisMock;