import { mockDeep, mockReset }  from 'jest-mock-extended';

const prismaMock = mockDeep();

beforeEach(() => {
  mockReset(prismaMock);
});

export default prismaMock;