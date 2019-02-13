import * as chai from 'chai';
import wkhtmltopdf from '../wkhtmltopdf';
chai.should();

describe('Wkhtml', () => {
  it('should return a Buffer if given an html text', async () => {
    const buffer = await wkhtmltopdf('<p>Test</p>');
    buffer.length.should.gte(0);
  });

  it('should return a Buffer if given a http url', async () => {
    const buffer = await wkhtmltopdf('http://www.google.com');
    buffer.length.should.gte(0);
  });
});
