import { describe, it, expect } from 'vitest'
import { Key } from '@puppeteer/replay';

import { InMemoryLineWriter } from './InMemoryLineWriter.js';
import { StringifyExtension } from '../src/stringifyExtension.js';


describe('StringifyExtension', () => {
  it('should correctly exports setViewport step', async () => {
    const ext = new StringifyExtension();
    const step = {
      type: 'setViewport' as const,
      width: 1905,
      height: 223,
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      isLandscape: false,
    };
    const flow = { title: 'setViewport step', steps: [step] };
    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);
    expect(writer.toString()).toBe('browser.setWindowSize(1905, 223)\n');
  });

  it('should correctly exports navigate step', async () => {
    const ext = new StringifyExtension();
    const step = {
      type: 'navigate' as const,
      url: 'chrome://new-tab-page/',
      assertedEvents: [
        {
          type: 'navigation' as const,
          url: 'chrome://new-tab-page/',
          title: 'New Tab',
        },
      ],
    };
    const flow = { title: 'navigate step', steps: [step] };
    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);
    expect(writer.toString()).toBe('await browser.url("chrome://new-tab-page/")\n');
  });

  it('should correctly exports click step', async () => {
    const ext = new StringifyExtension();
    const step = {
      type: 'click' as const,
      target: 'main',
      selectors: ['#test'],
      offsetX: 1,
      offsetY: 1,
    };
    const flow = { title: 'click step', steps: [step] };
    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);
    expect(writer.toString()).toBe('await browser.$("#test").click()\n');
  });

  it('should correctly exports change step', async () => {
    const ext = new StringifyExtension();
    const step = {
      type: 'change' as const,
      value: 'webdriverio',
      selectors: [['aria/Search'], ['#heading']],
      target: 'main',
    };
    const flow = { title: 'change step', steps: [step] };
    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);
    expect(writer.toString()).toBe('await browser.$("#heading").setValue("webdriverio")\n');
  });

  it('should correctly exports keyDown step', async () => {
    const ext = new StringifyExtension();
    const step = {
      type: 'keyDown' as const,
      target: 'main',
      key: 'Enter' as Key,
      assertedEvents: [
        {
          type: 'navigation' as const,
          url: 'https://google.com',
          title: 'webdriverio - Google Search',
        },
      ],
    };
    const flow = { title: 'keyDown step', steps: [step] };
    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);
    expect(writer.toString()).toBe(
      'await browser.performActions([{\n' +
      '  type: \'key\',\n' +
      '  id: \'keyboard\',\n' +
      '  actions: [{ type: \'keyDown\', value: \'ENTER\' }]\n' +
      '}])\n'
    );
  });

  it('should handle keyDown step when key is not supported', async () => {
    const ext = new StringifyExtension();
    const step = {
      type: 'keyDown' as const,
      target: 'main',
      key: 'KEY_DOESNT_EXIST' as Key,
      assertedEvents: [
        {
          type: 'navigation' as const,
          url: 'https://google.com',
          title: 'webdriverio - Google Search',
        },
      ],
    };
    const flow = { title: 'keyDown step', steps: [step] };
    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);
    expect(writer.toString()).toBe('\n');
  });

  it('should correctly exports keyUp step', async () => {
    const ext = new StringifyExtension();
    const step = {
      type: 'keyUp' as const,
      target: 'main',
      key: 'Enter' as Key,
      assertedEvents: [
        {
          type: 'navigation' as const,
          url: 'https://google.com',
          title: 'webdriverio - Google Search',
        },
      ],
    };
    const flow = { title: 'keyUp step', steps: [step] };
    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);
    expect(writer.toString()).toBe(
      'await browser.performActions([{\n' +
      '  type: \'key\',\n' +
      '  id: \'keyboard\',\n' +
      '  actions: [{ type: \'keyUp\', value: \'ENTER\' }]\n' +
      '}])\n'
    );
  });

  it('should correctly exports scroll step', async () => {
    const ext = new StringifyExtension();
    const step = {
      type: 'scroll' as const,
      target: 'main',
      x: 0,
      y: 805,
    };
    const flow = { title: 'scroll step', steps: [step] };
    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);
    expect(writer.toString()).toBe(`await browser.execute(() => window.scrollTo(0, 805))\n`);
  });

  it('should correctly exports doubleClick step', async () => {
    const ext = new StringifyExtension();
    const step = {
      type: 'doubleClick' as const,
      target: 'main',
      selectors: [['aria/Test'], ['#test']],
      offsetX: 1,
      offsetY: 1,
    };
    const flow = { title: 'doubleClick step', steps: [step] };
    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);
    expect(writer.toString()).toBe(`await browser.$("#test").doubleClick()\n`);
  });

  it('should correctly exports emulateNetworkConditions step', async () => {
    const ext = new StringifyExtension();
    const step = {
      type: 'emulateNetworkConditions' as const,
      download: 50000,
      upload: 50000,
      latency: 2000,
    };
    const flow = { title: 'emulateNetworkConditions step', steps: [step] };
    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);
    expect(writer.toString()).toBe(
      'await browser.setNetworkConditions({\n' +
      '  offline: false,\n' +
      '  latency: 2000,\n' +
      '  download_throughput: 50000,\n' +
      '  upload_throughput: 50000\n' +
      '})\n'
    )
  });

  it('should correctly exports waitForElement step if operator is "=="', async () => {
    const ext = new StringifyExtension();
    const step = {
      type: 'waitForElement' as const,
      selectors: ['#test'],
      operator: '==' as const,
      count: 2,
    };
    const flow = { title: 'waitForElement step', steps: [step] };
    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);
    expect(writer.toString()).toBe(
      'await browser.$("#test").waitForExist()\n' +
      'await expect(browser.$("#test")).toBeElementsArrayOfSize(2)\n'
    );
  });

  it('should correctly exports waitForElement step with timeout', async () => {
    const ext = new StringifyExtension();
    const step = {
      type: 'waitForElement' as const,
      selectors: ['#test'],
      operator: '==' as const,
      count: 2,
      timeout: 2000,
    };
    const flow = { title: 'waitForElement step', steps: [step] };
    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);
    expect(writer.toString()).toBe(
      'await browser.$("#test").waitForExist({ timeout: 2000 })\n' +
      'await expect(browser.$("#test")).toBeElementsArrayOfSize(2)\n'
    );
  });

  it('should correctly exports waitForElement step if operator is "<="', async () => {
    const ext = new StringifyExtension();
    const step = {
      type: 'waitForElement' as const,
      selectors: ['#test'],
      operator: '<=' as const,
      count: 2,
    };
    const flow = { title: 'waitForElement step', steps: [step] };
    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);
    expect(writer.toString()).toBe(
      'await browser.$("#test").waitForExist()\n' +
      'await expect(browser.$("#test")).toBeElementsArrayOfSize({ lte: 2 })\n'
    );
  });

  it('should correctly exports waitForElement step if operator is ">="', async () => {
    const ext = new StringifyExtension();
    const step = {
      type: 'waitForElement' as const,
      selectors: ['#test'],
      operator: '>=' as const,
      count: 2,
    };
    const flow = { title: 'waitForElement step', steps: [step] };
    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);
    expect(writer.toString()).toBe(
      'await browser.$("#test").waitForExist()\n' +
      'await expect(browser.$("#test")).toBeElementsArrayOfSize({ gte: 2 })\n'
    );
  });

  it('should correctly add Hover Step', async () => {
    const ext = new StringifyExtension();
    const step = {
      type: 'hover' as const,
      selectors: ['#test'],
    };
    const flow = { title: 'Hover step', steps: [step] };
    const writer = new InMemoryLineWriter('  ');
    await ext.stringifyStep(writer, step, flow);
    expect(writer.toString()).to.equal(`await browser.$("#test").moveTo()\n`);
  });
});
