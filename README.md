# **@sugo/wkhtmltopdf**

Simple promise-based wrapper for wkhtmltopdf.

## **Requirements**

node version >= 8
[wkhtmltopdf](https://wkhtmltopdf.org/index.html) installed

## **How to install**

```shell
npm install --save @sugo/wkhtmltopdf
```

## **Create a PDF**

From a HTML

```typescript
const buffer = await wkhtmltopdf('<p>Test</p>');
```

From a URL

```typescript
const buffer = await wkhtmltopdf('http://www.google.com');
```

## **Serve a pdf with a NodeJS Http Server**

```typescript
const filename = 'foo.pdf';
const buffer = await wkhtmltopdf('http://www.google.com');
res.setHeader('Content-Type', 'application/pdf');
res.setHeader('Content-Disposition', `attachment; filename=${filename}.pdf`);
res.setHeader('Content-Length', buffer.byteLength);
res.end(buffer);
```

## **Options**

The wkhtmltopdf function recieves a list of [wkhtmltopdf options](https://wkhtmltopdf.org/usage/wkhtmltopdf.txt).

## **Example**

```typescript
const buffer = await wkhtmltopdf('<p>Test</p>', ['--no-footer-line']);
```
