import { describe, test, expect } from 'vitest';
import { createNDArray } from '../src';

describe('test utils', () => {
  describe('test createNDArray', () => {
    test('test 1D array', () => {
      expect(createNDArray([3], 'integer')).toEqual({
        array: Array(3),
        type: 'integer[]'
      })
    })
    test('test 2D array', () => {
      expect(createNDArray([3, 2], 'integer')).toEqual({
        array: Array(3).fill(Array(2)),
        type: 'integer[][]'
      })
    })
    test('test 3D array', () => {
      expect(createNDArray([3, 2, 3], 'integer')).toEqual({
        array: Array(3).fill(Array(2).fill(Array(3))),
        type: 'integer[][][]'
      })
    })
  })
})