/**
 * Tests for documentExtractor utilities
 */

const { extractTextFromFile, extractTextFromPDF, extractTextFromDOCX } = require('../../utils/documentExtractor');

describe('documentExtractor', () => {
  describe('extractTextFromFile', () => {
    it('returns trimmed text for plain text files', async () => {
      const buffer = Buffer.from('  Hello Resume  ');
      const text = await extractTextFromFile(buffer, 'text/plain');
      expect(text).toBe('Hello Resume');
    });

    it('throws for empty buffers', async () => {
      await expect(extractTextFromFile(Buffer.alloc(0), 'text/plain')).rejects.toThrow('File buffer is empty');
    });

    it('throws for unsupported mime types', async () => {
      const buffer = Buffer.from('data');
      await expect(extractTextFromFile(buffer, 'application/zip')).rejects.toThrow('Unsupported file type: application/zip');
    });
  });

  describe('PDF extraction', () => {
    beforeAll(() => {
      jest.resetModules();
      jest.doMock('pdf-parse', () =>
        jest.fn(() =>
          Promise.resolve({
            text: 'PDF Content extracted from resume with sufficient length to pass the minimum threshold.',
            numpages: 2
          })
        )
      );
    });

    afterAll(() => {
      jest.dontMock('pdf-parse');
    });

    it('uses pdf-parse to extract text', async () => {
      // Re-require module to pick up mocked pdf-parse
      const { extractTextFromPDF: mockedExtract } = require('../../utils/documentExtractor');
      const buffer = Buffer.from('pdf');
      const result = await mockedExtract(buffer);
      expect(result).toBe('PDF Content extracted from resume with sufficient length to pass the minimum threshold.');
    });
  });

  describe('DOCX extraction', () => {
    beforeAll(() => {
      jest.resetModules();
      jest.doMock('mammoth', () => ({
        extractRawText: jest.fn(() => Promise.resolve({ value: 'DOCX Content' }))
      }));
    });

    afterAll(() => {
      jest.dontMock('mammoth');
    });

    it('uses mammoth to extract text', async () => {
      const { extractTextFromDOCX: mockedExtract } = require('../../utils/documentExtractor');
      const buffer = Buffer.from('docx');
      const result = await mockedExtract(buffer);
      expect(result).toBe('DOCX Content');
    });
  });
});


